package common

import (
	"context"
	"log"
	"time"

	"github.com/Sush1sui/fns-tickets/internal/repository"
	"github.com/bwmarrin/discordgo"
	"go.mongodb.org/mongo-driver/v2/bson"
)

func IsStaffMember(s *discordgo.Session, guildID string, member *discordgo.Member) bool {
	// Check if user has administrator permission by checking their roles
	guild, err := s.State.Guild(guildID)
	if err == nil {
		for _, roleID := range member.Roles {
			for _, role := range guild.Roles {
				if role.ID == roleID && (role.Permissions&discordgo.PermissionAdministrator) != 0 {
					return true
				}
			}
		}
	}

	// Fetch staff configuration from database
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	db := repository.GetDatabase()
	if db == nil {
		log.Printf("Database not available")
		return false
	}

	collection := db.Collection("servers")
	var result bson.M
	err = collection.FindOne(ctx, bson.M{"serverId": guildID}).Decode(&result)
	if err != nil {
		log.Printf("Error fetching server config: %v", err)
		return false
	}

	// Check staffs configuration
	if ticketConfig, ok := result["ticketConfig"].(bson.M); ok {
		if staffs, ok := ticketConfig["staffs"].(bson.M); ok {
			// Check if user is in authorized users list
			if users, ok := staffs["users"].(bson.A); ok {
				for _, userID := range users {
					userIDStr, ok := userID.(string)
					if !ok {
						continue
					}
					if userIDStr == member.User.ID {
						return true
					}
				}
			}

			// Check if user has any of the authorized roles
			if roles, ok := staffs["roles"].(bson.A); ok {
				for _, roleID := range roles {
					roleIDStr, ok := roleID.(string)
					if !ok {
						continue
					}
					for _, memberRole := range member.Roles {
						if memberRole == roleIDStr {
							return true
						}
					}
				}
			}
		}
	}
	return false
}