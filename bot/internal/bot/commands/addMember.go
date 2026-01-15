package commands

import (
	"fmt"
	"log"

	"github.com/Sush1sui/fns-tickets/internal/common"
	"github.com/Sush1sui/fns-tickets/internal/repository"
	"github.com/bwmarrin/discordgo"
)

func AddMember(s *discordgo.Session, i *discordgo.InteractionCreate) {
	if i.Member == nil || i.GuildID == "" {
		return
	}

	s.InteractionRespond(i.Interaction, &discordgo.InteractionResponse{
        Type: discordgo.InteractionResponseDeferredChannelMessageWithSource,
        Data: &discordgo.InteractionResponseData{
			Content: "Adding member to the ticket...",
            Flags: discordgo.MessageFlagsEphemeral,
        },
    })

	// Check if user is authorized
	if !common.IsStaffMember(s, i.GuildID, i.Member) {
		common.ResponseEdit(i, s, "❌ You do not have permission to use this command.")
		return
	}

	// Check if this is a ticket channel
	ticket, err := common.IsTicketChannel(i.ChannelID)
	if err != nil {
		log.Printf("Error checking ticket channel: %v", err)
		common.ResponseEdit(i, s, "❌ An error occurred while processing your request.")
		return
	}

	if ticket == nil {
		common.ResponseEdit(i, s, "❌ This command can only be used in ticket channels.")
		return
	}

	// Get the user option from the command
	options := i.ApplicationCommandData().Options
	if len(options) == 0 {
		common.ResponseEdit(i, s, "❌ No user specified.")
		return
	}

	userOption := options[0].UserValue(s)
	if userOption == nil {
		common.ResponseEdit(i, s, "❌ Invalid user specified.")
		return
	}

	// Check if user is already in the ticket
	channel, err := s.Channel(i.ChannelID)
	if err != nil {
		log.Printf("Error fetching channel: %v", err)
		common.ResponseEdit(i, s, "❌ An error occurred while checking channel permissions.")
		return
	}

	for _, overwrite := range channel.PermissionOverwrites {
		if overwrite.Type == discordgo.PermissionOverwriteTypeMember && overwrite.ID == userOption.ID {
			common.ResponseEdit(i, s, "❌ This user is already in the ticket.")
			return
		}
	}

	// Fetch guild config to get ticket permissions
	guildConfig, err := repository.GetGuildConfig(i.GuildID)
	if err != nil {
		log.Printf("Error fetching guild config: %v", err)
	}

	// Build permissions based on guild config
	var allowPermissions int64 = discordgo.PermissionViewChannel | discordgo.PermissionSendMessages | discordgo.PermissionReadMessageHistory

	if guildConfig != nil {
		if guildConfig.TicketConfig.TicketPermissions.Attachments {
			allowPermissions |= discordgo.PermissionAttachFiles | discordgo.PermissionEmbedLinks
		}
		if !guildConfig.TicketConfig.TicketPermissions.Links {
			// Links are controlled by EmbedLinks permission
			allowPermissions &^= discordgo.PermissionEmbedLinks
		}
		if guildConfig.TicketConfig.TicketPermissions.Reactions {
			allowPermissions |= discordgo.PermissionAddReactions
		}
	}

	// Add the user to the ticket channel with configured permissions
	err = s.ChannelPermissionSet(i.ChannelID, userOption.ID, discordgo.PermissionOverwriteTypeMember,
		allowPermissions, 0)

	if err != nil {
		log.Printf("Error adding user to ticket: %v", err)
		common.ResponseEdit(i, s, "❌ An error occurred while adding the user to the ticket.")
		return
	}

	// Send success response
	m := fmt.Sprintf("✅ Successfully added <@%s> to the ticket.", userOption.ID)
	s.InteractionResponseEdit(i.Interaction, &discordgo.WebhookEdit{
		Content: &m,
	})
}