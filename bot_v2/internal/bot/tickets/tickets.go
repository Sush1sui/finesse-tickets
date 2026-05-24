package tickets

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"strconv"
	"strings"
	"time"

	"github.com/Sush1sui/FNS_BOT/internal/db"
	"github.com/bwmarrin/discordgo"
	"github.com/jackc/pgx/v5/pgtype"
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
			if s != nil && s.State != nil {
				channels, err := queries.GetActiveTicketChannelsByUser(ctx, serverID, i.Member.User.ID)
				if err == nil {
					for _, channelID := range channels {
						if _, err := s.State.Channel(channelID); err == nil {
							continue
						}
						if err := queries.DeleteActiveTicketByChannel(ctx, serverID, channelID); err != nil {
							log.Printf("delete stale active ticket failed: %v", err)
						}
					}
					count, err = queries.CountActiveTicketsByUser(ctx, serverID, i.Member.User.ID)
					if err != nil {
						return err
					}
				}
			}
			if count >= int64(serverConfig.MaxTicketPerUser) {
				return errMaxTickets
			}
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

	saveTranscriptOnClose(s, i)

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

type transcriptPayload struct {
	TicketID string `json:"ticketId"`
	Username string `json:"username"`
	UserID   string `json:"userId"`
	Messages []transcriptMessage `json:"messages"`
	Metadata transcriptMetadata `json:"metadata"`
}

type transcriptAuthor struct {
	ID            string  `json:"id"`
	Username      string  `json:"username"`
	Discriminator string  `json:"discriminator"`
	Avatar        *string `json:"avatar"`
	Bot           bool    `json:"bot"`
}

type transcriptEmbedField struct {
	Name   string `json:"name"`
	Value  string `json:"value"`
	Inline bool   `json:"inline"`
}

type transcriptImage struct {
	URL string `json:"url"`
}

type transcriptFooter struct {
	Text    string  `json:"text"`
	IconURL *string `json:"iconUrl"`
}

type transcriptEmbedAuthor struct {
	Name    string  `json:"name"`
	URL     *string `json:"url"`
	IconURL *string `json:"iconUrl"`
}

type transcriptEmbed struct {
	Title       *string               `json:"title"`
	Description *string               `json:"description"`
	URL         *string               `json:"url"`
	Color       *int                  `json:"color"`
	Fields      []transcriptEmbedField `json:"fields"`
	Image       *transcriptImage      `json:"image"`
	Thumbnail   *transcriptImage      `json:"thumbnail"`
	Footer      *transcriptFooter     `json:"footer"`
	Author      *transcriptEmbedAuthor `json:"author"`
}

type transcriptAttachment struct {
	ID          string  `json:"id"`
	Filename    string  `json:"filename"`
	URL         string  `json:"url"`
	ProxyURL    string  `json:"proxyUrl"`
	Size        int     `json:"size"`
	ContentType *string `json:"contentType"`
	Width       *int    `json:"width"`
	Height      *int    `json:"height"`
}

type transcriptReaction struct {
	Emoji string `json:"emoji"`
	Count int    `json:"count"`
}

type transcriptMessage struct {
	ID              string               `json:"id"`
	Type            string               `json:"type"`
	Author          transcriptAuthor     `json:"author"`
	Content         *string              `json:"content"`
	Timestamp       string               `json:"timestamp"`
	Embeds          []transcriptEmbed    `json:"embeds,omitempty"`
	Attachments     []transcriptAttachment `json:"attachments,omitempty"`
	Edited          bool                 `json:"edited"`
	EditedTimestamp *string              `json:"editedTimestamp"`
	Reactions       []transcriptReaction `json:"reactions,omitempty"`
}

type transcriptClosedBy struct {
	ID       string `json:"id"`
	Username string `json:"username"`
}

type transcriptParticipant struct {
	ID           string `json:"id"`
	Username     string `json:"username"`
	MessageCount int    `json:"messageCount"`
}

type transcriptMetadata struct {
	TicketOpenedAt   string                 `json:"ticketOpenedAt"`
	TicketClosedAt   string                 `json:"ticketClosedAt"`
	ClosedBy         transcriptClosedBy     `json:"closedBy"`
	TotalMessages    int                    `json:"totalMessages"`
	TotalAttachments int                    `json:"totalAttachments"`
	TotalEmbeds      int                    `json:"totalEmbeds"`
	Participants     []transcriptParticipant `json:"participants"`
}

func saveTranscriptOnClose(s *discordgo.Session, i *discordgo.InteractionCreate) {
	if queries == nil || storageClient == nil {
		return
	}
	if i == nil || i.GuildID == "" || i.ChannelID == "" {
		return
	}

	serverID, err := strconv.ParseInt(i.GuildID, 10, 64)
	if err != nil {
		return
	}

	serverConfig, err := queries.GetServerConfig(context.Background(), serverID)
	if err != nil || !serverConfig.TicketTranscriptCid.Valid || serverConfig.TicketTranscriptCid.String == "" {
		return
	}

	messages, err := fetchAllMessages(s, i.ChannelID)
	if err != nil {
		log.Printf("fetch transcript messages failed: %v", err)
		return
	}

	openedAt := int64(0)
	userID := ""
	username := ""
	if info, err := queries.GetActiveTicketByChannel(context.Background(), serverID, i.ChannelID); err == nil {
		openedAt = info.CreatedAt
		userID = info.UserID
	}
	if openedAt == 0 {
		openedAt = time.Now().Unix()
	}
	if userID == "" && i.Member != nil && i.Member.User != nil {
		userID = i.Member.User.ID
		username = i.Member.User.Username
	}
	if username == "" && userID != "" && s != nil && s.State != nil {
		if m, err := s.State.Member(i.GuildID, userID); err == nil && m.User != nil {
			username = m.User.Username
		}
	}

	closedBy := ""
	if i.Member != nil && i.Member.User != nil {
		closedBy = i.Member.User.ID
	}
	closedAt := time.Now().Unix()

	content, totalAttachments, totalEmbeds, participants := buildTranscriptContent(messages)

	payload := transcriptPayload{
		TicketID: i.ChannelID,
		Username: username,
		UserID:   userID,
		Messages: content,
		Metadata: transcriptMetadata{
			TicketOpenedAt:   time.Unix(openedAt, 0).UTC().Format(time.RFC3339),
			TicketClosedAt:   time.Unix(closedAt, 0).UTC().Format(time.RFC3339),
			ClosedBy:         transcriptClosedBy{ID: closedBy, Username: usernameOrID(s, i.GuildID, closedBy)},
			TotalMessages:    len(content),
			TotalAttachments: totalAttachments,
			TotalEmbeds:      totalEmbeds,
			Participants:     participants,
		},
	}

	data, err := json.Marshal(payload)
	if err != nil {
		log.Printf("marshal transcript failed: %v", err)
		return
	}

	storageKey := fmt.Sprintf("transcripts/%d/%s/%d.json", serverID, i.ChannelID, closedAt)
	if err := storageClient.UploadTranscript(context.Background(), storageKey, data); err != nil {
		log.Printf("upload transcript failed: %v", err)
		return
	}

	row, err := queries.CreateTranscript(context.Background(), db.CreateTranscriptParams{
		ServerConfigID: serverID,
		TicketID:       pgtype.Text{String: i.ChannelID, Valid: true},
		Username:       pgtype.Text{String: username, Valid: username != ""},
		UserID:         pgtype.Text{String: userID, Valid: userID != ""},
		OpenedAt:       openedAt,
		ClosedAt:       closedAt,
		ClosedBy:       closedBy,
		StorageKey:     storageKey,
		TotalMessages:  pgtype.Int4{Int32: int32(len(content)), Valid: true},
		TotalAttachments: pgtype.Int4{Int32: int32(totalAttachments), Valid: true},
		TotalEmbeds:    pgtype.Int4{Int32: int32(totalEmbeds), Valid: true},
	})
	if err != nil {
		log.Printf("create transcript row failed: %v", err)
		return
	}

	if s != nil {
		_, _ = s.ChannelMessageSend(serverConfig.TicketTranscriptCid.String, fmt.Sprintf("Transcript saved. ID: %d", row.ID))
	}
}

func usernameOrID(s *discordgo.Session, guildID, userID string) string {
	if userID == "" {
		return ""
	}
	if s != nil && s.State != nil {
		if m, err := s.State.Member(guildID, userID); err == nil && m.User != nil {
			return m.User.Username
		}
	}
	return userID
}

func buildTranscriptContent(messages []*discordgo.Message) ([]transcriptMessage, int, int, []transcriptParticipant) {
	items := make([]transcriptMessage, 0, len(messages))
	participants := make(map[string]*transcriptParticipant)
	attachmentsTotal := 0
	embedsTotal := 0

	for _, m := range messages {
		if m == nil || m.Author == nil {
			continue
		}

		attachmentsTotal += len(m.Attachments)
		embedsTotal += len(m.Embeds)

		msgType := "message"
		content := m.Content

		timestamp := m.Timestamp.Format(time.RFC3339)
		item := transcriptMessage{
			ID:        m.ID,
			Type:      msgType,
			Author: transcriptAuthor{
				ID:            m.Author.ID,
				Username:      m.Author.Username,
				Discriminator: m.Author.Discriminator,
				Avatar:        strPtr(m.Author.Avatar),
				Bot:           m.Author.Bot,
			},
			Content:   &content,
			Timestamp: timestamp,
			Edited:    m.EditedTimestamp != nil,
		}
		if m.EditedTimestamp != nil {
			edited := m.EditedTimestamp.Format(time.RFC3339)
			item.EditedTimestamp = &edited
		}

		if len(m.Embeds) > 0 {
			item.Embeds = make([]transcriptEmbed, 0, len(m.Embeds))
			for _, e := range m.Embeds {
				embed := transcriptEmbed{
					Title:       strPtr(e.Title),
					Description: strPtr(e.Description),
					URL:         strPtr(e.URL),
					Color:       intPtr(e.Color),
					Fields:      make([]transcriptEmbedField, 0, len(e.Fields)),
				}
				for _, f := range e.Fields {
					embed.Fields = append(embed.Fields, transcriptEmbedField{Name: f.Name, Value: f.Value, Inline: f.Inline})
				}
				if e.Image != nil {
					embed.Image = &transcriptImage{URL: e.Image.URL}
				}
				if e.Thumbnail != nil {
					embed.Thumbnail = &transcriptImage{URL: e.Thumbnail.URL}
				}
				if e.Footer != nil {
					embed.Footer = &transcriptFooter{Text: e.Footer.Text, IconURL: strPtr(e.Footer.IconURL)}
				}
				if e.Author != nil {
					embed.Author = &transcriptEmbedAuthor{Name: e.Author.Name, URL: strPtr(e.Author.URL), IconURL: strPtr(e.Author.IconURL)}
				}
				item.Embeds = append(item.Embeds, embed)
			}
		}

		if len(m.Attachments) > 0 {
			item.Attachments = make([]transcriptAttachment, 0, len(m.Attachments))
			for _, a := range m.Attachments {
				item.Attachments = append(item.Attachments, transcriptAttachment{
					ID:          a.ID,
					Filename:    a.Filename,
					URL:         a.URL,
					ProxyURL:    a.ProxyURL,
					Size:        a.Size,
					ContentType: strPtr(a.ContentType),
					Width:       intPtr(a.Width),
					Height:      intPtr(a.Height),
				})
			}
		}

		if len(m.Reactions) > 0 {
			item.Reactions = make([]transcriptReaction, 0, len(m.Reactions))
			for _, r := range m.Reactions {
				emoji := r.Emoji.Name
				item.Reactions = append(item.Reactions, transcriptReaction{Emoji: emoji, Count: r.Count})
			}
		}

		items = append(items, item)
		if p, ok := participants[m.Author.ID]; ok {
			p.MessageCount++
		} else {
			participants[m.Author.ID] = &transcriptParticipant{ID: m.Author.ID, Username: m.Author.Username, MessageCount: 1}
		}
	}

	list := make([]transcriptParticipant, 0, len(participants))
	for _, p := range participants {
		list = append(list, *p)
	}

	return items, attachmentsTotal, embedsTotal, list
}

func strPtr(value string) *string {
	if value == "" {
		return nil
	}
	return &value
}

func intPtr(value int) *int {
	if value == 0 {
		return nil
	}
	return &value
}

func fetchAllMessages(s *discordgo.Session, channelID string) ([]*discordgo.Message, error) {
	if s == nil {
		return nil, fmt.Errorf("missing session")
	}

	all := make([]*discordgo.Message, 0)
	before := ""
	for {
		msgs, err := s.ChannelMessages(channelID, 100, before, "", "")
		if err != nil {
			return nil, err
		}
		if len(msgs) == 0 {
			break
		}
		all = append(all, msgs...)
		before = msgs[len(msgs)-1].ID
		if len(msgs) < 100 {
			break
		}
	}

	for i, j := 0, len(all)-1; i < j; i, j = i+1, j-1 {
		all[i], all[j] = all[j], all[i]
	}

	return all, nil
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
