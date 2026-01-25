package events

import (
	"strings"

	"github.com/Sush1sui/fns-tickets/internal/common"
	"github.com/Sush1sui/fns-tickets/internal/repository"
	"github.com/bwmarrin/discordgo"
)

// HandleModalSubmit handles modal submissions for panel questions
func HandleModalSubmit(s *discordgo.Session, i *discordgo.InteractionCreate) {
    if i.Type != discordgo.InteractionModalSubmit {
        return
    }

    data := i.ModalSubmitData()
    customID := data.CustomID
    if !strings.HasPrefix(customID, "panel_modal_") {
        return
    }

    panelID := strings.TrimPrefix(customID, "panel_modal_")

    questions, err := repository.GetPanelQuestionPrompts(panelID)
    if err != nil || len(questions) == 0 {
        // No questions found for this panel, cannot process
        s.InteractionRespond(i.Interaction, &discordgo.InteractionResponse{
            Type: discordgo.InteractionResponseChannelMessageWithSource,
            Data: &discordgo.InteractionResponseData{
                Content: "❌ Unable to process your responses. Please try again later.",
                Flags:   discordgo.MessageFlagsEphemeral,
            },
        })
        return
    }

    // Extract answers: current discordgo presents modal rows as *ActionsRow
    answers := []string{}
    for _, row := range data.Components {
        if ar, ok := row.(*discordgo.ActionsRow); ok && ar != nil {
            for _, comp := range ar.Components {
                switch ti := comp.(type) {
                case *discordgo.TextInput:
                    if ti != nil {
                        answers = append(answers, ti.Value)
                    } else {
                        answers = append(answers, "")
                    }
                case discordgo.TextInput:
                    answers = append(answers, ti.Value)
                default:
                    // unknown component type - append empty to preserve order
                    answers = append(answers, "")
                }
            }
        } else if ar2, ok := row.(discordgo.ActionsRow); ok {
            for _, comp := range ar2.Components {
                switch ti := comp.(type) {
                case *discordgo.TextInput:
                    if ti != nil {
                        answers = append(answers, ti.Value)
                    } else {
                        answers = append(answers, "")
                    }
                case discordgo.TextInput:
                    answers = append(answers, ti.Value)
                default:
                    answers = append(answers, "")
                }
            }
        }
    }

    // Pair prompts with answers into QnA and call open ticket flow
    qas := make([]common.QnA, 0, len(questions))
    for idx, q := range questions {
        a := ""
        if idx < len(answers) {
            a = answers[idx]
        }
        qas = append(qas, common.QnA{Question: q, Answer: a})
    }

    common.HandleOpenTicket(s, i, panelID, qas)
}
