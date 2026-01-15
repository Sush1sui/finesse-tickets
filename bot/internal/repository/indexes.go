package repository

import (
	"context"
	"time"

	"go.mongodb.org/mongo-driver/v2/bson"
	"go.mongodb.org/mongo-driver/v2/mongo"
	"go.mongodb.org/mongo-driver/v2/mongo/options"
)

// EnsureIndexes creates necessary database indexes for performance
func EnsureIndexes() error {
	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	ticketsCollection := database.Collection("tickets")
	serversCollection := database.Collection("servers")

	// Tickets collection indexes
	ticketIndexes := []mongo.IndexModel{
		{
			Keys: bson.D{
				{Key: "guildId", Value: 1},
				{Key: "userId", Value: 1},
				{Key: "closed", Value: 1},
			},
			Options: options.Index().SetName("idx_guild_user_closed"),
		},
		{
			Keys: bson.D{
				{Key: "channelId", Value: 1},
			},
			Options: options.Index().SetName("idx_channelId").SetUnique(true),
		},
		{
			Keys: bson.D{
				{Key: "closed", Value: 1},
				{Key: "lastMessageAt", Value: 1},
			},
			Options: options.Index().SetName("idx_closed_lastMessage"),
		},
		{
			Keys: bson.D{
				{Key: "guildId", Value: 1},
				{Key: "closed", Value: 1},
			},
			Options: options.Index().SetName("idx_guild_closed"),
		},
		{
			Keys: bson.D{
				{Key: "userId", Value: 1},
				{Key: "guildId", Value: 1},
			},
			Options: options.Index().SetName("idx_user_guild"),
		},
	}

	_, err := ticketsCollection.Indexes().CreateMany(ctx, ticketIndexes)
	if err != nil {
		return err
	}

	// Servers collection indexes (ensure serverId is indexed)
	serverIndexes := []mongo.IndexModel{
		{
			Keys: bson.D{
				{Key: "serverId", Value: 1},
			},
			Options: options.Index().SetName("idx_serverId").SetUnique(true),
		},
	}

	_, err = serversCollection.Indexes().CreateMany(ctx, serverIndexes)
	if err != nil {
		return err
	}

	return nil
}
