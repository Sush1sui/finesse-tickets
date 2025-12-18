package repository

import (
	"context"
	"fmt"
	"time"

	"go.mongodb.org/mongo-driver/v2/bson"
)

// GetUserActiveTickets returns active tickets for a specific user in a guild
func GetUserActiveTickets(guildID, userID string) ([]Ticket, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	collection := database.Collection("tickets")
	
	var tickets []Ticket
	cursor, err := collection.Find(ctx, bson.M{
		"guildId": guildID,
		"userId":  userID,
		"closed":  false,
	})
	if err != nil {
		return nil, fmt.Errorf("failed to fetch user tickets: %w", err)
	}
	defer cursor.Close(ctx)

	if err := cursor.All(ctx, &tickets); err != nil {
		return nil, fmt.Errorf("failed to decode tickets: %w", err)
	}

	return tickets, nil
}
