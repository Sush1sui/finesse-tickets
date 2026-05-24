package utils

import (
	"strconv"
	"strings"

	"github.com/Sush1sui/FNS_BOT/internal/db"
	"github.com/bwmarrin/discordgo"
	"github.com/jackc/pgx/v5/pgtype"
)

func ButtonStyleFromColor(color string) discordgo.ButtonStyle {
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

func ParseComponentEmoji(input string) *discordgo.ComponentEmoji {
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

func BuildMultiPanelComponents(useDropdown bool, panels []db.PanelButtonConfig) []discordgo.MessageComponent {
	if useDropdown {
		options := make([]discordgo.SelectMenuOption, 0, len(panels))
		for _, panel := range panels {
			option := discordgo.SelectMenuOption{
				Label: panel.Title,
				Value: strconv.Itoa(int(panel.ID)),
			}
			if emoji := ParseComponentEmoji(TextOrEmpty(panel.BtnEmoji)); emoji != nil {
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
			Style:    ButtonStyleFromColor(panel.BtnColor),
			CustomID: "open_ticket_" + strconv.Itoa(int(panel.ID)),
		}
		if emoji := ParseComponentEmoji(TextOrEmpty(panel.BtnEmoji)); emoji != nil {
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

func TextOrEmpty(value pgtype.Text) string {
	if value.Valid {
		return value.String
	}
	return ""
}
