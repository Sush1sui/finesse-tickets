package common

import (
	"context"
	"fmt"
	"time"

	"github.com/Sush1sui/fns-tickets/internal/repository"
	"go.mongodb.org/mongo-driver/v2/bson"
	"go.mongodb.org/mongo-driver/v2/mongo"
)

func IsTicketChannel(channelID string) (*repository.Ticket, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	db := repository.GetDatabase()
	if db == nil {
		return nil, fmt.Errorf("database not available")
	}

	collection := db.Collection("tickets")
	var ticket repository.Ticket
	err := collection.FindOne(ctx, bson.M{
		"channelId": channelID,
		"closed":    false,
	}).Decode(&ticket)

	if err != nil {
		if err == mongo.ErrNoDocuments {
			return nil, nil
		}
		return nil, err
	}

	return &ticket, nil
}