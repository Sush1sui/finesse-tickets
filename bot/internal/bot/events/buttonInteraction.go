package events

import (
	"strings"

	"github.com/Sush1sui/fns-tickets/internal/common"
	"github.com/bwmarrin/discordgo"
)

// HandleButtonInteraction handles ticket panel button clicks and select menus
func HandleButtonInteraction(s *discordgo.Session, i *discordgo.InteractionCreate) {
	if i.Type != discordgo.InteractionMessageComponent {
		return
	}

	data := i.MessageComponentData()
	customID := data.CustomID
	
	// Check if it's a select menu for multi-panel
	if customID == "select_panel" {
		if len(data.Values) > 0 {
			panelID := data.Values[0]
			common.HandleOpenTicket(s, i, panelID)
		}
		return
	}
	
	// Check if it's a ticket open button
	if strings.HasPrefix(customID, "open_ticket_") {
		panelID := strings.TrimPrefix(customID, "open_ticket_")
		common.HandleOpenTicket(s, i, panelID)
		return
	}

	// Check if it's a close button
	if customID == "close_ticket" {
		common.HandleCloseTicket(s, i)
		return
	}
}










