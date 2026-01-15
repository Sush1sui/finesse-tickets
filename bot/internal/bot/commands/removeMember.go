package commands

import (
	"log"

	"github.com/Sush1sui/fns-tickets/internal/common"
	"github.com/bwmarrin/discordgo"
)

func RemoveMember(s *discordgo.Session, i *discordgo.InteractionCreate) {
	if i.Member == nil || i.GuildID == "" {
		return
	}

	// Defer response
	s.InteractionRespond(i.Interaction, &discordgo.InteractionResponse{
		Type: discordgo.InteractionResponseDeferredChannelMessageWithSource,
		Data: &discordgo.InteractionResponseData{
			Flags: discordgo.MessageFlagsEphemeral,
		},
	})

	// Check if user is authorized
	if !common.IsStaffMember(s, i.GuildID, i.Member) {
		common.ResponseEdit(i, s, "❌ You don't have permission to use this command.")
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

	// Prevent removing the ticket owner
	if userOption.ID == ticket.UserID {
		common.ResponseEdit(i, s, "❌ You cannot remove the ticket owner from their own ticket.")
		return
	}

	// Check if user is actually in the ticket
	channel, err := s.Channel(i.ChannelID)
	if err != nil {
		log.Printf("Error fetching channel: %v", err)
		common.ResponseEdit(i, s, "❌ An error occurred while checking channel permissions.")
		return
	}

	userHasPermission := false
	for _, overwrite := range channel.PermissionOverwrites {
		if overwrite.Type == discordgo.PermissionOverwriteTypeMember && overwrite.ID == userOption.ID {
			userHasPermission = true
			break
		}
	}

	if !userHasPermission {
		common.ResponseEdit(i, s, "❌ This user is not in the ticket.")
		return
	}

	// Remove the user from the ticket channel
	err = s.ChannelPermissionDelete(i.ChannelID, userOption.ID)
	if err != nil {
		log.Printf("Error removing user from ticket: %v", err)
		common.ResponseEdit(i, s, "❌ An error occurred while removing the user from the ticket.")
		return
	}

	// Send success response
	common.ResponseEdit(i, s, "✅ Successfully removed <@"+userOption.ID+"> from the ticket.")
}