package events

import (
	"fmt"
	"strings"

	"github.com/Sush1sui/fns-tickets/internal/common"
	"github.com/Sush1sui/fns-tickets/internal/repository"
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
			// Check for panel questions first
			prompts, err := repository.GetPanelQuestionPrompts(panelID)
			if err == nil && len(prompts) > 0 {
				// Build modal with text inputs
				components := make([]discordgo.MessageComponent, 0)
				for idx, p := range prompts {
					input := discordgo.TextInput{
						CustomID:  fmt.Sprintf("q_%d", idx),
						Label:     p,
						Style:     discordgo.TextInputParagraph,
						Required:  true,
						MaxLength: 4000,
					}
					components = append(components, discordgo.ActionsRow{Components: []discordgo.MessageComponent{input}})
				}

				modalCustomID := fmt.Sprintf("panel_modal_%s", panelID)
				s.InteractionRespond(i.Interaction, &discordgo.InteractionResponse{
					Type: discordgo.InteractionResponseModal,
					Data: &discordgo.InteractionResponseData{
						CustomID: modalCustomID,
						Title:    "Please answer the following",
						Components: components,
					},
				})
				return
			}

			common.HandleOpenTicket(s, i, panelID, nil)
		}
		return
	}
	
	// Check if it's a ticket open button
	if strings.HasPrefix(customID, "open_ticket_") {
		panelID := strings.TrimPrefix(customID, "open_ticket_")

		prompts, err := repository.GetPanelQuestionPrompts(panelID)
		if err == nil && len(prompts) > 0 {
			components := make([]discordgo.MessageComponent, 0)
			for idx, p := range prompts {
				input := discordgo.TextInput{
					CustomID:  fmt.Sprintf("q_%d", idx),
					Label:     p,
					Style:     discordgo.TextInputParagraph,
					Required:  true,
					MaxLength: 4000,
				}
				components = append(components, discordgo.ActionsRow{Components: []discordgo.MessageComponent{input}})
			}
			modalCustomID := fmt.Sprintf("panel_modal_%s", panelID)
			s.InteractionRespond(i.Interaction, &discordgo.InteractionResponse{
				Type: discordgo.InteractionResponseModal,
				Data: &discordgo.InteractionResponseData{
					CustomID: modalCustomID,
					Title:    "Please answer the following",
					Components: components,
				},
			})
			return
		}

		common.HandleOpenTicket(s, i, panelID, nil)
		return
	}

	// Check if it's a close button
	if customID == "close_ticket" {
		common.HandleCloseTicket(s, i)
		return
	}
}










