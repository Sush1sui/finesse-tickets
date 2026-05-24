package panels

import (
	"context"
	"encoding/json"
	"errors"
	"log"
	"net/http"
	"strconv"
	"strings"

	"github.com/Sush1sui/FNS_BOT/internal/bot"
	"github.com/Sush1sui/FNS_BOT/internal/db"
	"github.com/bwmarrin/discordgo"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgtype"
)

type Handler struct {
	DB *db.Queries
}

func writeJSON(w http.ResponseWriter, status int, data any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	json.NewEncoder(w).Encode(data)
}

type PanelPayload struct {
	MentionRolesOnOpen []string              `json:"mentionRolesOnOpen"`
	CategoryID         string                `json:"categoryId"`
	Title              string                `json:"title"`
	Content            string                `json:"content"`
	EmbedColor         int32                 `json:"embedColor"`
	ChannelID          string                `json:"channelId"`
	BtnColor           string                `json:"btnColor"`
	BtnTxt             string                `json:"btnTxt"`
	BtnEmoji           string                `json:"btnEmoji"`
	LargeImgUrl        string                `json:"largeImgUrl"`
	SmallImgUrl        string                `json:"smallImgUrl"`
	Questions          []string              `json:"questions"`
	WelcomeMessage     WelcomeMessagePayload `json:"welcomeMessage"`
}

type WelcomeMessagePayload struct {
	EmbedColor    int32  `json:"embedColor"`
	Title         string `json:"title"`
	Description   string `json:"description"`
	TitleURL      string `json:"titleUrl"`
	LargeImgUrl   string `json:"largeImgUrl"`
	SmallImgUrl   string `json:"smallImgUrl"`
	FooterText    string `json:"footerText"`
	FooterIconUrl string `json:"footerIconUrl"`
}

type MultiPanelPayload struct {
	Title          string  `json:"title"`
	Content        string  `json:"content"`
	EmbedColor     int32   `json:"embedColor"`
	ChannelID      string  `json:"channelId"`
	LargeImgUrl    string  `json:"largeImgUrl"`
	SmallImgUrl    string  `json:"smallImgUrl"`
	UseDropdown    bool    `json:"useDropdown"`
	PanelConfigIds []int32 `json:"panelConfigIds"`
	Footer         string  `json:"footer"`
	FootIconUrl    string  `json:"footIconUrl"`
}

type PanelDetail struct {
	MentionRolesOnOpen []string               `json:"mentionRolesOnOpen"`
	CategoryID         string                 `json:"categoryId"`
	Title              string                 `json:"title"`
	Content            string                 `json:"content"`
	EmbedColor         int32                  `json:"embedColor"`
	ChannelID          string                 `json:"channelId"`
	BtnColor           string                 `json:"btnColor"`
	BtnTxt             string                 `json:"btnTxt"`
	BtnEmoji           string                 `json:"btnEmoji"`
	LargeImgUrl        string                 `json:"largeImgUrl"`
	SmallImgUrl        string                 `json:"smallImgUrl"`
	Questions          []string               `json:"questions"`
	WelcomeMessage     *WelcomeMessagePayload `json:"welcomeMessage"`
}

type MultiPanelDetail struct {
	Title          string  `json:"title"`
	Content        string  `json:"content"`
	EmbedColor     int32   `json:"embedColor"`
	ChannelID      string  `json:"channelId"`
	LargeImgUrl    string  `json:"largeImgUrl"`
	SmallImgUrl    string  `json:"smallImgUrl"`
	UseDropdown    bool    `json:"useDropdown"`
	PanelConfigIds []int32 `json:"panelConfigIds"`
	Footer         string  `json:"footer"`
	FootIconUrl    string  `json:"footIconUrl"`
}

func (h *Handler) HandleListPanels(w http.ResponseWriter, r *http.Request) {
	serverID, err := parseServerID(r)
	if err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "invalid server id"})
		return
	}

	items, err := h.DB.GetPanelConfigsByServer(context.Background(), serverID)
	if err != nil {
		log.Printf("load panels failed: %v", err)
		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": "failed to load panels: " + err.Error()})
		return
	}
	writeJSON(w, http.StatusOK, items)
}

func (h *Handler) HandleGetPanel(w http.ResponseWriter, r *http.Request) {
	serverID, panelID, err := parseServerPanelIDs(r)
	if err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "invalid ids"})
		return
	}

	item, err := h.DB.GetPanelConfigByID(context.Background(), serverID, panelID)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			writeJSON(w, http.StatusNotFound, map[string]string{"error": "panel not found"})
			return
		}
		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": "failed to load panel"})
		return
	}

	questions, err := h.DB.GetPanelQuestions(context.Background(), panelID)
	if err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": "failed to load questions"})
		return
	}

	welcome, hasWelcome, err := h.DB.GetPanelWelcome(context.Background(), panelID)
	if err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": "failed to load welcome message"})
		return
	}

	var welcomePayload *WelcomeMessagePayload
	if hasWelcome {
		welcomePayload = &WelcomeMessagePayload{
			EmbedColor:    welcome.EmbedColor,
			Title:         welcome.Title,
			Description:   welcome.Description,
			TitleURL:      textOrEmpty(welcome.TitleUrl),
			LargeImgUrl:   textOrEmpty(welcome.LargeImgUrl),
			SmallImgUrl:   textOrEmpty(welcome.SmallImgUrl),
			FooterText:    textOrEmpty(welcome.Footer),
			FooterIconUrl: textOrEmpty(welcome.FooterIconUrl),
		}
	}

	writeJSON(w, http.StatusOK, PanelDetail{
		MentionRolesOnOpen: item.MentionRolesOnOpen,
		CategoryID:         textOrEmpty(item.CategoryID),
		Title:              item.Title,
		Content:            textOrEmpty(item.Content),
		EmbedColor:         item.EmbedColor,
		ChannelID:          item.ChannelID,
		BtnColor:           item.BtnColor,
		BtnTxt:             item.BtnTxt,
		BtnEmoji:           textOrEmpty(item.BtnEmoji),
		LargeImgUrl:        textOrEmpty(item.LargeImgUrl),
		SmallImgUrl:        textOrEmpty(item.SmallImgUrl),
		Questions:          questions,
		WelcomeMessage:     welcomePayload,
	})
}

func (h *Handler) HandleCreatePanel(w http.ResponseWriter, r *http.Request) {
	serverID, err := parseServerID(r)
	if err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "invalid server id"})
		return
	}

	if _, err := h.DB.GetServerConfig(context.Background(), serverID); err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			if err := h.DB.EnsureServerConfig(context.Background(), serverID); err != nil {
				log.Printf("create default server config failed: %v", err)
				writeJSON(w, http.StatusInternalServerError, map[string]string{"error": "failed to create server config"})
				return
			}
		} else {
			log.Printf("load server config failed: %v", err)
			writeJSON(w, http.StatusInternalServerError, map[string]string{"error": "failed to load server config"})
			return
		}
	}

	var payload PanelPayload
	if err := json.NewDecoder(r.Body).Decode(&payload); err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "invalid json"})
		return
	}

	if missing := missingPanelFields(payload); len(missing) > 0 {
		writeJSON(w, http.StatusBadRequest, map[string]string{
			"error":   "missing required fields",
			"missing": strings.Join(missing, ", "),
		})
		return
	}

	item, err := h.DB.CreatePanelConfig(context.Background(), db.CreatePanelConfigParams{
		ServerConfigID:     serverID,
		MentionRolesOnOpen: payload.MentionRolesOnOpen,
		CategoryID:         toText(payload.CategoryID),
		Title:              payload.Title,
		Content:            toText(payload.Content),
		EmbedColor:         payload.EmbedColor,
		ChannelID:          payload.ChannelID,
		BtnColor:           payload.BtnColor,
		BtnTxt:             payload.BtnTxt,
		BtnEmoji:           toText(payload.BtnEmoji),
		LargeImgUrl:        toText(payload.LargeImgUrl),
		SmallImgUrl:        toText(payload.SmallImgUrl),
	})
	if err != nil {
		log.Printf("create panel failed: %v", err)
		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": "failed to create panel"})
		return
	}
	if err := h.DB.ReplaceQuestionsConfig(context.Background(), item.ID, payload.Questions); err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": "failed to save questions"})
		return
	}
	if err := h.DB.ReplaceWelcomeMsgConfig(
		context.Background(),
		item.ID,
		toWelcomeParams(payload.WelcomeMessage),
		hasWelcomeMessage(payload.WelcomeMessage),
	); err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": "failed to save welcome message"})
		return
	}
	writeJSON(w, http.StatusCreated, item)
}

func (h *Handler) HandleUpdatePanel(w http.ResponseWriter, r *http.Request) {
	serverID, panelID, err := parseServerPanelIDs(r)
	if err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "invalid ids"})
		return
	}

	var payload PanelPayload
	if err := json.NewDecoder(r.Body).Decode(&payload); err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "invalid json"})
		return
	}

	if missing := missingPanelFields(payload); len(missing) > 0 {
		writeJSON(w, http.StatusBadRequest, map[string]string{
			"error":   "missing required fields",
			"missing": strings.Join(missing, ", "),
		})
		return
	}

	item, err := h.DB.UpdatePanelConfig(context.Background(), db.UpdatePanelConfigParams{
		ID:                 panelID,
		ServerConfigID:     serverID,
		MentionRolesOnOpen: payload.MentionRolesOnOpen,
		CategoryID:         toText(payload.CategoryID),
		Title:              payload.Title,
		Content:            toText(payload.Content),
		EmbedColor:         payload.EmbedColor,
		ChannelID:          payload.ChannelID,
		BtnColor:           payload.BtnColor,
		BtnTxt:             payload.BtnTxt,
		BtnEmoji:           toText(payload.BtnEmoji),
		LargeImgUrl:        toText(payload.LargeImgUrl),
		SmallImgUrl:        toText(payload.SmallImgUrl),
	})
	if err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": "failed to update panel"})
		return
	}
	if err := h.DB.ReplaceQuestionsConfig(context.Background(), panelID, payload.Questions); err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": "failed to save questions"})
		return
	}
	if err := h.DB.ReplaceWelcomeMsgConfig(
		context.Background(),
		panelID,
		toWelcomeParams(payload.WelcomeMessage),
		hasWelcomeMessage(payload.WelcomeMessage),
	); err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": "failed to save welcome message"})
		return
	}
	writeJSON(w, http.StatusOK, item)
}

func (h *Handler) HandleDeletePanel(w http.ResponseWriter, r *http.Request) {
	serverID, panelID, err := parseServerPanelIDs(r)
	if err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "invalid ids"})
		return
	}

	if err := h.DB.RemovePanelFromMultiPanels(context.Background(), serverID, panelID); err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": "failed to prune multi panels"})
		return
	}
	if err := h.DB.DeletePanelConfig(context.Background(), panelID, serverID); err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": "failed to delete panel"})
		return
	}
	writeJSON(w, http.StatusOK, map[string]string{"status": "deleted"})
}

func (h *Handler) HandleSendPanel(w http.ResponseWriter, r *http.Request) {
	serverID, panelID, err := parseServerPanelIDs(r)
	if err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "invalid ids"})
		return
	}

	sess := bot.Session
	if sess == nil {
		writeJSON(w, http.StatusServiceUnavailable, map[string]string{"error": "bot not ready"})
		return
	}

	item, err := h.DB.GetPanelConfigByID(r.Context(), serverID, panelID)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			writeJSON(w, http.StatusNotFound, map[string]string{"error": "panel not found"})
			return
		}
		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": "failed to load panel"})
		return
	}

	embed := &discordgo.MessageEmbed{
		Title:       item.Title,
		Description: textOrEmpty(item.Content),
		Color:       int(item.EmbedColor),
	}

	if item.LargeImgUrl.Valid {
		embed.Image = &discordgo.MessageEmbedImage{URL: item.LargeImgUrl.String}
	}
	if item.SmallImgUrl.Valid {
		embed.Thumbnail = &discordgo.MessageEmbedThumbnail{URL: item.SmallImgUrl.String}
	}

	button := discordgo.Button{
		Label:    item.BtnTxt,
		Style:    buttonStyleFromColor(item.BtnColor),
		CustomID: "open_ticket_" + strconv.Itoa(int(item.ID)),
	}
	if emoji := parseComponentEmoji(textOrEmpty(item.BtnEmoji)); emoji != nil {
		button.Emoji = emoji
	}

	msg, err := sess.ChannelMessageSendComplex(item.ChannelID, &discordgo.MessageSend{
		Embeds: []*discordgo.MessageEmbed{embed},
		Components: []discordgo.MessageComponent{
			discordgo.ActionsRow{Components: []discordgo.MessageComponent{button}},
		},
	})
	if err != nil {
		log.Printf("send panel failed: %v", err)
		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": "failed to send panel: " + err.Error()})
		return
	}

	writeJSON(w, http.StatusOK, map[string]string{"messageId": msg.ID})
}

func (h *Handler) HandleListMultiPanels(w http.ResponseWriter, r *http.Request) {
	serverID, err := parseServerID(r)
	if err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "invalid server id"})
		return
	}

	items, err := h.DB.GetMultiPanelConfigsByServer(context.Background(), serverID)
	if err != nil {
		log.Printf("load multi panels failed: %v", err)
		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": "failed to load multi panels: " + err.Error()})
		return
	}
	writeJSON(w, http.StatusOK, items)
}

func (h *Handler) HandleGetMultiPanel(w http.ResponseWriter, r *http.Request) {
	serverID, multiPanelID, err := parseServerMultiPanelIDs(r)
	if err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "invalid ids"})
		return
	}

	item, err := h.DB.GetMultiPanelConfigByID(context.Background(), serverID, multiPanelID)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			writeJSON(w, http.StatusNotFound, map[string]string{"error": "multi panel not found"})
			return
		}
		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": "failed to load multi panel"})
		return
	}

	writeJSON(w, http.StatusOK, MultiPanelDetail{
		Title:          item.Title,
		Content:        textOrEmpty(item.Content),
		EmbedColor:     item.EmbedColor,
		ChannelID:      item.ChannelID,
		LargeImgUrl:    textOrEmpty(item.LargeImgUrl),
		SmallImgUrl:    textOrEmpty(item.SmallImgUrl),
		UseDropdown:    item.UseDropdown,
		PanelConfigIds: item.PanelConfigIds,
		Footer:         textOrEmpty(item.Footer),
		FootIconUrl:    textOrEmpty(item.FootIconUrl),
	})
}

func (h *Handler) HandleCreateMultiPanel(w http.ResponseWriter, r *http.Request) {
	serverID, err := parseServerID(r)
	if err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "invalid server id"})
		return
	}

	var payload MultiPanelPayload
	if err := json.NewDecoder(r.Body).Decode(&payload); err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "invalid json"})
		return
	}

	if missing := missingMultiPanelFields(payload); len(missing) > 0 {
		writeJSON(w, http.StatusBadRequest, map[string]string{
			"error":   "missing required fields",
			"missing": strings.Join(missing, ", "),
		})
		return
	}

	item, err := h.DB.CreateMultiPanelConfig(context.Background(), db.CreateMultiPanelConfigParams{
		ServerConfigID: serverID,
		Title:          payload.Title,
		Content:        toText(payload.Content),
		EmbedColor:     payload.EmbedColor,
		ChannelID:      payload.ChannelID,
		LargeImgUrl:    toText(payload.LargeImgUrl),
		SmallImgUrl:    toText(payload.SmallImgUrl),
		UseDropdown:    payload.UseDropdown,
		PanelConfigIds: payload.PanelConfigIds,
		Footer:         toText(payload.Footer),
		FootIconUrl:    toText(payload.FootIconUrl),
	})
	if err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": "failed to create multi panel"})
		return
	}
	writeJSON(w, http.StatusCreated, item)
}

func (h *Handler) HandleUpdateMultiPanel(w http.ResponseWriter, r *http.Request) {
	serverID, multiPanelID, err := parseServerMultiPanelIDs(r)
	if err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "invalid ids"})
		return
	}

	var payload MultiPanelPayload
	if err := json.NewDecoder(r.Body).Decode(&payload); err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "invalid json"})
		return
	}

	if missing := missingMultiPanelFields(payload); len(missing) > 0 {
		writeJSON(w, http.StatusBadRequest, map[string]string{
			"error":   "missing required fields",
			"missing": strings.Join(missing, ", "),
		})
		return
	}

	item, err := h.DB.UpdateMultiPanelConfig(context.Background(), db.UpdateMultiPanelConfigParams{
		ID:             multiPanelID,
		ServerConfigID: serverID,
		Title:          payload.Title,
		Content:        toText(payload.Content),
		EmbedColor:     payload.EmbedColor,
		ChannelID:      payload.ChannelID,
		LargeImgUrl:    toText(payload.LargeImgUrl),
		SmallImgUrl:    toText(payload.SmallImgUrl),
		UseDropdown:    payload.UseDropdown,
		PanelConfigIds: payload.PanelConfigIds,
		Footer:         toText(payload.Footer),
		FootIconUrl:    toText(payload.FootIconUrl),
	})
	if err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": "failed to update multi panel"})
		return
	}
	writeJSON(w, http.StatusOK, item)
}

func (h *Handler) HandleDeleteMultiPanel(w http.ResponseWriter, r *http.Request) {
	serverID, multiPanelID, err := parseServerMultiPanelIDs(r)
	if err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "invalid ids"})
		return
	}

	if err := h.DB.DeleteMultiPanelConfig(context.Background(), multiPanelID, serverID); err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": "failed to delete multi panel"})
		return
	}
	writeJSON(w, http.StatusOK, map[string]string{"status": "deleted"})
}

func (h *Handler) HandleSendMultiPanel(w http.ResponseWriter, r *http.Request) {
	serverID, multiPanelID, err := parseServerMultiPanelIDs(r)
	if err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "invalid ids"})
		return
	}

	sess := bot.Session
	if sess == nil {
		writeJSON(w, http.StatusServiceUnavailable, map[string]string{"error": "bot not ready"})
		return
	}

	item, err := h.DB.GetMultiPanelConfigByID(r.Context(), serverID, multiPanelID)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			writeJSON(w, http.StatusNotFound, map[string]string{"error": "multi panel not found"})
			return
		}
		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": "failed to load multi panel"})
		return
	}

	if len(item.PanelConfigIds) == 0 {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "multi panel has no panels"})
		return
	}

	panels, err := h.DB.GetPanelButtonConfigsByIDs(r.Context(), serverID, item.PanelConfigIds)
	if err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": "failed to load panel buttons"})
		return
	}
	if len(panels) == 0 {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "no panels available"})
		return
	}

	embed := &discordgo.MessageEmbed{
		Title:       item.Title,
		Description: textOrEmpty(item.Content),
		Color:       int(item.EmbedColor),
	}
	if item.LargeImgUrl.Valid {
		embed.Image = &discordgo.MessageEmbedImage{URL: item.LargeImgUrl.String}
	}
	if item.SmallImgUrl.Valid {
		embed.Thumbnail = &discordgo.MessageEmbedThumbnail{URL: item.SmallImgUrl.String}
	}
	if item.Footer.Valid {
		embed.Footer = &discordgo.MessageEmbedFooter{Text: item.Footer.String}
		if item.FootIconUrl.Valid {
			embed.Footer.IconURL = item.FootIconUrl.String
		}
	}

	components := buildMultiPanelComponents(item.UseDropdown, panels)
	msg, err := sess.ChannelMessageSendComplex(item.ChannelID, &discordgo.MessageSend{
		Embeds:     []*discordgo.MessageEmbed{embed},
		Components: components,
	})
	if err != nil {
		log.Printf("send multi panel failed: %v", err)
		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": "failed to send multi panel: " + err.Error()})
		return
	}

	writeJSON(w, http.StatusOK, map[string]string{"messageId": msg.ID})
}

func parseServerID(r *http.Request) (int64, error) {
	serverIDStr := r.PathValue("server_id")
	return strconv.ParseInt(serverIDStr, 10, 64)
}

func parseServerPanelIDs(r *http.Request) (int64, int32, error) {
	serverIDStr := r.PathValue("server_id")
	panelIDStr := r.PathValue("panel_id")
	serverID, err := strconv.ParseInt(serverIDStr, 10, 64)
	if err != nil {
		return 0, 0, err
	}
	panelID64, err := strconv.ParseInt(panelIDStr, 10, 32)
	if err != nil {
		return 0, 0, err
	}
	return serverID, int32(panelID64), nil
}

func hasWelcomeMessage(msg WelcomeMessagePayload) bool {
	return msg.Title != "" || msg.Description != "" || msg.TitleURL != "" ||
		msg.LargeImgUrl != "" || msg.SmallImgUrl != "" || msg.FooterText != "" ||
		msg.FooterIconUrl != ""
}

func toWelcomeParams(msg WelcomeMessagePayload) db.WelcomeMessageParams {
	return db.WelcomeMessageParams{
		EmbedColor:    msg.EmbedColor,
		Title:         msg.Title,
		Description:   msg.Description,
		TitleURL:      toText(msg.TitleURL),
		LargeImgUrl:   toText(msg.LargeImgUrl),
		SmallImgUrl:   toText(msg.SmallImgUrl),
		Footer:        toText(msg.FooterText),
		FooterIconUrl: toText(msg.FooterIconUrl),
	}
}

func parseServerMultiPanelIDs(r *http.Request) (int64, int32, error) {
	serverIDStr := r.PathValue("server_id")
	panelIDStr := r.PathValue("multi_panel_id")
	serverID, err := strconv.ParseInt(serverIDStr, 10, 64)
	if err != nil {
		return 0, 0, err
	}
	panelID64, err := strconv.ParseInt(panelIDStr, 10, 32)
	if err != nil {
		return 0, 0, err
	}
	return serverID, int32(panelID64), nil
}

func toText(value string) pgtype.Text {
	return pgtype.Text{String: value, Valid: value != ""}
}

func textOrEmpty(value pgtype.Text) string {
	if value.Valid {
		return value.String
	}
	return ""
}

func isBlank(value string) bool {
	return strings.TrimSpace(value) == ""
}

func missingPanelFields(payload PanelPayload) []string {
	missing := make([]string, 0, 5)
	if isBlank(payload.Title) {
		missing = append(missing, "title")
	}
	if isBlank(payload.Content) {
		missing = append(missing, "content")
	}
	if isBlank(payload.ChannelID) {
		missing = append(missing, "channelId")
	}
	if isBlank(payload.BtnColor) {
		missing = append(missing, "btnColor")
	}
	if isBlank(payload.BtnTxt) {
		missing = append(missing, "btnTxt")
	}
	return missing
}

func missingMultiPanelFields(payload MultiPanelPayload) []string {
	missing := make([]string, 0, 3)
	if isBlank(payload.Title) {
		missing = append(missing, "title")
	}
	if isBlank(payload.Content) {
		missing = append(missing, "content")
	}
	if isBlank(payload.ChannelID) {
		missing = append(missing, "channelId")
	}
	return missing
}

func buttonStyleFromColor(color string) discordgo.ButtonStyle {
	switch strings.ToLower(color) {
	case "blue":
		return discordgo.PrimaryButton
	case "green":
		return discordgo.SuccessButton
	case "red":
		return discordgo.DangerButton
	case "gray":
		return discordgo.SecondaryButton
	default:
		return discordgo.PrimaryButton
	}
}

func parseComponentEmoji(input string) *discordgo.ComponentEmoji {
	value := strings.TrimSpace(input)
	if value == "" {
		return nil
	}

	if strings.HasPrefix(value, "<") && strings.HasSuffix(value, ">") {
		parts := strings.Split(value[1:len(value)-1], ":")
		if len(parts) >= 3 {
			return &discordgo.ComponentEmoji{
				Name:     parts[1],
				ID:       parts[2],
				Animated: parts[0] == "a",
			}
		}
		return nil
	}

	// Support stored format: name:id or a:name:id
	if strings.Count(value, ":") >= 1 {
		parts := strings.Split(value, ":")
		if len(parts) == 2 {
			return &discordgo.ComponentEmoji{
				Name: parts[0],
				ID:   parts[1],
			}
		}
		if len(parts) >= 3 {
			return &discordgo.ComponentEmoji{
				Name:     parts[1],
				ID:       parts[2],
				Animated: parts[0] == "a",
			}
		}
	}

	return &discordgo.ComponentEmoji{Name: value}
}

func buildMultiPanelComponents(useDropdown bool, panels []db.PanelButtonConfig) []discordgo.MessageComponent {
	if useDropdown {
		options := make([]discordgo.SelectMenuOption, 0, len(panels))
		for _, panel := range panels {
			option := discordgo.SelectMenuOption{
				Label: panel.Title,
				Value: strconv.Itoa(int(panel.ID)),
			}
			if emoji := parseComponentEmoji(textOrEmpty(panel.BtnEmoji)); emoji != nil {
				option.Emoji = emoji
			}
			options = append(options, option)
		}

		return []discordgo.MessageComponent{
			discordgo.ActionsRow{
				Components: []discordgo.MessageComponent{
					discordgo.SelectMenu{
						CustomID:    "select_panel",
						Placeholder: "Select a panel...",
						Options:     options,
					},
				},
			},
		}
	}

	rows := make([]discordgo.MessageComponent, 0)
	current := make([]discordgo.MessageComponent, 0, 5)
	for i, panel := range panels {
		button := discordgo.Button{
			Label:    panel.BtnTxt,
			Style:    buttonStyleFromColor(panel.BtnColor),
			CustomID: "open_ticket_" + strconv.Itoa(int(panel.ID)),
		}
		if emoji := parseComponentEmoji(textOrEmpty(panel.BtnEmoji)); emoji != nil {
			button.Emoji = emoji
		}

		current = append(current, button)
		if len(current) == 5 || i == len(panels)-1 {
			rows = append(rows, discordgo.ActionsRow{Components: current})
			current = make([]discordgo.MessageComponent, 0, 5)
		}
	}

	return rows
}
