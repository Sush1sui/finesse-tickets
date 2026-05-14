package panels

import (
	"context"
	"encoding/json"
	"log"
	"net/http"
	"strconv"

	"github.com/Sush1sui/FNS_BOT/internal/db"
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

func (h *Handler) HandleCreatePanel(w http.ResponseWriter, r *http.Request) {
	serverID, err := parseServerID(r)
	if err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "invalid server id"})
		return
	}

	var payload PanelPayload
	if err := json.NewDecoder(r.Body).Decode(&payload); err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "invalid json"})
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

	if err := h.DB.DeletePanelConfig(context.Background(), panelID, serverID); err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": "failed to delete panel"})
		return
	}
	writeJSON(w, http.StatusOK, map[string]string{"status": "deleted"})
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
		msg.FooterIconUrl != "" || msg.EmbedColor != 0
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
