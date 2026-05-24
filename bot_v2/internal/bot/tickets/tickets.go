package tickets

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"strconv"
	"strings"
	"time"

	"github.com/bwmarrin/discordgo"
)

type QnA struct {
	Question string
	Answer   string
}

const (
	panelButtonPrefix = "open_ticket_"
	panelSelectID     = "select_panel"
	panelModalPrefix  = "ticket_modal_"
	closeTicketID     = "close_ticket"
)

var errMaxTickets = fmt.Errorf("max tickets reached")

func HandleComponentInteraction(s *discordgo.Session, i *discordgo.InteractionCreate) {
	if i == nil || i.Type != discordgo.InteractionMessageComponent {
		return
	}

	data := i.MessageComponentData()
	switch {
	case strings.HasPrefix(data.CustomID, panelButtonPrefix):
		panelID, ok := parsePanelID(data.CustomID, panelButtonPrefix)
		if !ok {
			return
		}
		handlePanelOpen(s, i, panelID)
	case data.CustomID == panelSelectID:
		if len(data.Values) == 0 {
			return
		}
		panelID, err := strconv.Atoi(data.Values[0])
		if err != nil {
			return
		}
		handlePanelOpen(s, i, int32(panelID))
	case data.CustomID == closeTicketID:
		handleCloseTicket(s, i)
	}
}

func HandleModalSubmit(s *discordgo.Session, i *discordgo.InteractionCreate) {
	if i == nil || i.Type != discordgo.InteractionModalSubmit {
		return
	}

	data := i.ModalSubmitData()
	if !strings.HasPrefix(data.CustomID, panelModalPrefix) {
		return
	}

	panelID, ok := parsePanelID(data.CustomID, panelModalPrefix)
	if !ok {
		return
	}

	questions, answers := extractModalAnswers(data)
	qna := make([]QnA, 0, len(questions))
	for idx, q := range questions {
		ans := ""
		if idx < len(answers) {
			ans = answers[idx]
		}
		qna = append(qna, QnA{Question: q, Answer: ans})
	}

	respondDeferred(s, i)
	if err := openTicket(s, i, panelID, qna); err != nil {
		log.Printf("open ticket failed: %v", err)
		if err == errMaxTickets {
			editEphemeral(s, i, "You reached max open tickets. Please close existing tickets.")
			return
		}
		editEphemeral(s, i, "Failed to create ticket. Please try again later.")
		return
	}
}

func handlePanelOpen(s *discordgo.Session, i *discordgo.InteractionCreate, panelID int32) {
	questions, err := loadPanelQuestions(i.GuildID, panelID)
	if err != nil {
		log.Printf("load questions failed: %v", err)
		respondEphemeral(s, i, "Failed to load panel. Please try again later.")
		return
	}

	if len(questions) > 0 {
		showQuestionsModal(s, i, panelID, questions)
		return
	}

	respondDeferred(s, i)
	if err := openTicket(s, i, panelID, nil); err != nil {
		log.Printf("open ticket failed: %v", err)
		if err == errMaxTickets {
			editEphemeral(s, i, "You reached max open tickets. Please close existing tickets.")
			return
		}
		editEphemeral(s, i, "Failed to create ticket. Please try again later.")
		return
	}
}

func openTicket(s *discordgo.Session, i *discordgo.InteractionCreate, panelID int32, qna []QnA) error {
	if queries == nil {
		return fmt.Errorf("queries not set")
	}
	if i.GuildID == "" || i.Member == nil || i.Member.User == nil {
		return fmt.Errorf("missing guild/member")
	}

	ctx := context.Background()
	serverID, err := strconv.ParseInt(i.GuildID, 10, 64)
	if err != nil {
		return err
	}

	panel, err := queries.GetPanelConfigByID(ctx, serverID, panelID)
	if err != nil {
		return err
	}

	welcomeMsg, hasWelcome, err := queries.GetPanelWelcome(ctx, panelID)
	if err != nil {
		return err
	}

	serverConfig, _ := queries.GetServerConfig(ctx, serverID)
	if serverConfig.MaxTicketPerUser > 0 {
		count, err := queries.CountActiveTicketsByUser(ctx, serverID, i.Member.User.ID)
		if err != nil {
			return err
		}
		if count >= int64(serverConfig.MaxTicketPerUser) {
			return errMaxTickets
		}
	}
	allowedPerms := parseTicketPermissions(serverConfig.TicketPermissions)
	userPerms := baseUserPerms(allowedPerms)
	staffPerms := staffPerms()

	parentID := ""
	if panel.CategoryID.Valid {
		parentID = panel.CategoryID.String
	}

	channelName := buildTicketChannelName(serverConfig.TicketNameStyle, i.Member.User.Username, i.ID)
	channelTopic := fmt.Sprintf("ticket_opener:%s panel:%d", i.Member.User.ID, panelID)

	overwrites, err := buildPermissionOverwrites(ctx, s, i, serverID, panel.MentionRolesOnOpen, userPerms, staffPerms)
	if err != nil {
		return err
	}

	channel, err := s.GuildChannelCreateComplex(i.GuildID, discordgo.GuildChannelCreateData{
		Name:                 channelName,
		Type:                 discordgo.ChannelTypeGuildText,
		ParentID:             parentID,
		Topic:                channelTopic,
		PermissionOverwrites: overwrites,
	})
	if err != nil {
		return err
	}

	if err := queries.CreateActiveTicket(ctx, serverID, i.Member.User.ID, channel.ID, time.Now().Unix()); err != nil {
		log.Printf("create active ticket failed: %v", err)
	}

	SendWelcomeMessage(s, channel.ID, i.Member.User, panel.MentionRolesOnOpen, welcomeMsg, hasWelcome, qna)
	editEphemeral(s, i, fmt.Sprintf("Ticket created! Please check <#%s>", channel.ID))
	return nil
}

func buildPermissionOverwrites(ctx context.Context, s *discordgo.Session, i *discordgo.InteractionCreate, serverID int64, mentionRoles []string, userPerms, staffPerms int64) ([]*discordgo.PermissionOverwrite, error) {
	overwrites := make([]*discordgo.PermissionOverwrite, 0, 6)
	added := map[string]struct{}{}

	overwrites = append(overwrites, &discordgo.PermissionOverwrite{
		ID:   i.GuildID,
		Type: discordgo.PermissionOverwriteTypeRole,
		Deny: discordgo.PermissionViewChannel,
	})
	added[i.GuildID] = struct{}{}

	userID := i.Member.User.ID
	overwrites = append(overwrites, &discordgo.PermissionOverwrite{
		ID:    userID,
		Type:  discordgo.PermissionOverwriteTypeMember,
		Allow: userPerms,
	})
	added[userID] = struct{}{}

	if s != nil && s.State != nil && s.State.User != nil {
		botID := s.State.User.ID
		if _, ok := added[botID]; !ok {
			overwrites = append(overwrites, &discordgo.PermissionOverwrite{
				ID:    botID,
				Type:  discordgo.PermissionOverwriteTypeMember,
				Allow: discordgo.PermissionViewChannel | discordgo.PermissionSendMessages | discordgo.PermissionReadMessageHistory | discordgo.PermissionManageChannels,
			})
			added[botID] = struct{}{}
		}
	}

	if queries != nil {
		members, _ := queries.GetAuthorizedMembers(ctx, serverID)
		for _, mid := range members {
			if mid == "" {
				continue
			}
			if _, ok := added[mid]; ok {
				continue
			}
			overwrites = append(overwrites, &discordgo.PermissionOverwrite{
				ID:    mid,
				Type:  discordgo.PermissionOverwriteTypeMember,
				Allow: staffPerms,
			})
			added[mid] = struct{}{}
		}

		roles, _ := queries.GetAuthorizedRoles(ctx, serverID)
		for _, rid := range roles {
			if rid == "" {
				continue
			}
			if _, ok := added[rid]; ok {
				continue
			}
			overwrites = append(overwrites, &discordgo.PermissionOverwrite{
				ID:    rid,
				Type:  discordgo.PermissionOverwriteTypeRole,
				Allow: staffPerms,
			})
			added[rid] = struct{}{}
		}
	}

	for _, roleID := range mentionRoles {
		if roleID == "" {
			continue
		}
		if _, ok := added[roleID]; ok {
			continue
		}
		overwrites = append(overwrites, &discordgo.PermissionOverwrite{
			ID:    roleID,
			Type:  discordgo.PermissionOverwriteTypeRole,
			Allow: staffPerms,
		})
		added[roleID] = struct{}{}
	}

	return overwrites, nil
}

func handleCloseTicket(s *discordgo.Session, i *discordgo.InteractionCreate) {
	respondDeferred(s, i)

	channelID := i.ChannelID
	if channelID == "" {
		editEphemeral(s, i, "Channel not found.")
		return
	}

	if !canCloseTicket(s, i) {
		editEphemeral(s, i, "Not allowed to close this ticket.")
		return
	}

	if queries != nil {
		serverID, err := strconv.ParseInt(i.GuildID, 10, 64)
		if err == nil {
			if err := queries.DeleteActiveTicketByChannel(context.Background(), serverID, channelID); err != nil {
				log.Printf("delete active ticket failed: %v", err)
			}
		}
	}

	if _, err := s.ChannelDelete(channelID); err != nil {
		editEphemeral(s, i, "Failed to close ticket.")
		return
	}
}

func canCloseTicket(s *discordgo.Session, i *discordgo.InteractionCreate) bool {
	if i == nil || i.Member == nil || i.Member.User == nil {
		return false
	}

	channel := getChannelFromInteraction(s, i)
	if channel != nil && strings.Contains(channel.Topic, "ticket_opener:") {
		parts := strings.Split(channel.Topic, "ticket_opener:")
		if len(parts) > 1 {
			opener := strings.Fields(parts[1])
			if len(opener) > 0 && opener[0] == i.Member.User.ID {
				return true
			}
		}
	}

	serverID, err := strconv.ParseInt(i.GuildID, 10, 64)
	if err != nil {
		return false
	}

	if queries != nil {
		members, _ := queries.GetAuthorizedMembers(context.Background(), serverID)
		for _, mid := range members {
			if mid == i.Member.User.ID {
				return true
			}
		}

		roles, _ := queries.GetAuthorizedRoles(context.Background(), serverID)
		roleSet := make(map[string]struct{}, len(i.Member.Roles))
		for _, rid := range i.Member.Roles {
			roleSet[rid] = struct{}{}
		}
		for _, rid := range roles {
			if _, ok := roleSet[rid]; ok {
				return true
			}
		}
	}

	return false
}

func showQuestionsModal(s *discordgo.Session, i *discordgo.InteractionCreate, panelID int32, questions []string) {
	inputs := make([]discordgo.MessageComponent, 0, 5)
	limit := len(questions)
	if limit > 5 {
		limit = 5
	}

	for idx := 0; idx < limit; idx++ {
		q := questions[idx]
		inputs = append(inputs, discordgo.ActionsRow{
			Components: []discordgo.MessageComponent{
				discordgo.TextInput{
					CustomID: fmt.Sprintf("q_%d", idx),
					Label:    q,
					Style:    discordgo.TextInputParagraph,
					Required: false,
				},
			},
		})
	}

	_ = s.InteractionRespond(i.Interaction, &discordgo.InteractionResponse{
		Type: discordgo.InteractionResponseModal,
		Data: &discordgo.InteractionResponseData{
			CustomID: fmt.Sprintf("%s%d", panelModalPrefix, panelID),
			Title:    "Ticket Questions",
			Components: inputs,
		},
	})
}

func loadPanelQuestions(guildID string, panelID int32) ([]string, error) {
	if queries == nil {
		return nil, fmt.Errorf("queries not set")
	}
	serverID, err := strconv.ParseInt(guildID, 10, 64)
	if err != nil {
		return nil, err
	}

	_, err = queries.GetPanelConfigByID(context.Background(), serverID, panelID)
	if err != nil {
		return nil, err
	}

	return queries.GetPanelQuestions(context.Background(), panelID)
}

func parsePanelID(value, prefix string) (int32, bool) {
	idStr := strings.TrimPrefix(value, prefix)
	if idStr == "" {
		return 0, false
	}
	id64, err := strconv.ParseInt(idStr, 10, 32)
	if err != nil {
		return 0, false
	}
	return int32(id64), true
}

func parseTicketPermissions(raw []byte) map[string]struct{} {
	perms := make(map[string]struct{})
	if len(raw) == 0 {
		return perms
	}

	var list []string
	if err := json.Unmarshal(raw, &list); err != nil {
		return perms
	}
	for _, item := range list {
		perms[item] = struct{}{}
	}
	return perms
}

func baseUserPerms(perms map[string]struct{}) int64 {
	var allow int64 = discordgo.PermissionViewChannel | discordgo.PermissionSendMessages | discordgo.PermissionReadMessageHistory
	if _, ok := perms["attachFiles"]; ok {
		allow |= discordgo.PermissionAttachFiles
	}
	if _, ok := perms["embedLinks"]; ok {
		allow |= discordgo.PermissionEmbedLinks
	}
	if _, ok := perms["addReactions"]; ok {
		allow |= discordgo.PermissionAddReactions
	}
	return allow
}

func getChannelFromInteraction(s *discordgo.Session, i *discordgo.InteractionCreate) *discordgo.Channel {
	if s == nil || i == nil || i.ChannelID == "" {
		return nil
	}

	if s.State != nil {
		if ch, err := s.State.Channel(i.ChannelID); err == nil {
			return ch
		}
	}

	ch, err := s.Channel(i.ChannelID)
	if err != nil {
		return nil
	}
	return ch
}

func staffPerms() int64 {
	return discordgo.PermissionViewChannel | discordgo.PermissionSendMessages | discordgo.PermissionReadMessageHistory | discordgo.PermissionAddReactions | discordgo.PermissionAttachFiles | discordgo.PermissionEmbedLinks
}

func buildTicketChannelName(style, username, interactionID string) string {
	name := "ticket"
	if style == "name" && username != "" {
		name = "ticket-" + username
	} else {
		suffix := interactionID
		if len(suffix) > 4 {
			suffix = suffix[len(suffix)-4:]
		}
		name = fmt.Sprintf("ticket-%s", suffix)
	}

	name = strings.ToLower(name)
	name = strings.ReplaceAll(name, " ", "-")
	name = strings.ReplaceAll(name, "--", "-")
	return name
}

func respondDeferred(s *discordgo.Session, i *discordgo.InteractionCreate) {
	_ = s.InteractionRespond(i.Interaction, &discordgo.InteractionResponse{
		Type: discordgo.InteractionResponseDeferredChannelMessageWithSource,
		Data: &discordgo.InteractionResponseData{
			Flags: discordgo.MessageFlagsEphemeral,
		},
	})
}

func respondEphemeral(s *discordgo.Session, i *discordgo.InteractionCreate, message string) {
	_ = s.InteractionRespond(i.Interaction, &discordgo.InteractionResponse{
		Type: discordgo.InteractionResponseChannelMessageWithSource,
		Data: &discordgo.InteractionResponseData{
			Content: message,
			Flags:   discordgo.MessageFlagsEphemeral,
		},
	})
}

func editEphemeral(s *discordgo.Session, i *discordgo.InteractionCreate, message string) {
	_, _ = s.InteractionResponseEdit(i.Interaction, &discordgo.WebhookEdit{Content: &message})
}

func extractModalAnswers(data discordgo.ModalSubmitInteractionData) ([]string, []string) {
	questions := make([]string, 0, 5)
	answers := make([]string, 0, 5)

	for _, row := range data.Components {
		components, ok := row.(discordgo.ActionsRow)
		if !ok {
			continue
		}
		for _, comp := range components.Components {
			input, ok := comp.(discordgo.TextInput)
			if !ok {
				continue
			}
			questions = append(questions, input.Label)
			answers = append(answers, input.Value)
		}
	}

	return questions, answers
}

// keep helpers in welcome.go
