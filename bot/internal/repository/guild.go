package repository

import (
	"context"
	"fmt"
	"log"
	"os"
	"time"

	"go.mongodb.org/mongo-driver/v2/bson"
	"go.mongodb.org/mongo-driver/v2/mongo"
	"go.mongodb.org/mongo-driver/v2/mongo/options"
)

var client *mongo.Client
var database *mongo.Database

// GuildConfig represents the guild's ticket configuration
type GuildConfig struct {
	GuildID              string              `bson:"serverId"`
	TicketConfig         TicketConfig        `bson:"ticketConfig"`
}

type TicketConfig struct {
	TicketNameStyle      string              `bson:"ticketNameStyle"`
	MaxTicketsPerUser    int                 `bson:"maxTicketsPerUser"`
	TicketTranscript     *string             `bson:"ticketTranscript"`
	TicketPermissions    TicketPermissions   `bson:"ticketPermissions"`
	AutoClose            AutoClose           `bson:"autoClose"`
}

type TicketPermissions struct {
	Attachments bool `bson:"attachments"`
	Links       bool `bson:"links"`
	Reactions   bool `bson:"reactions"`
}

type AutoClose struct {
	Enabled                    bool         `bson:"enabled"`
	CloseWhenUserLeaves        bool         `bson:"closeWhenUserLeaves"`
	SinceOpenWithoutResponse   TimeDuration `bson:"sinceOpenWithoutResponse"`
	SinceLastResponse          TimeDuration `bson:"sinceLastResponse"`
}

type TimeDuration struct {
	Days    int `bson:"Days"`
	Hours   int `bson:"Hours"`
	Minutes int `bson:"Minutes"`
}

// Ticket represents an active ticket
type Ticket struct {
	ID              bson.ObjectID `bson:"_id,omitempty"`
	GuildID         string        `bson:"guildId"`
	ChannelID       string        `bson:"channelId"`
	UserID          string        `bson:"userId"`
	PanelID         string        `bson:"panelId"`
	CreatedAt       time.Time     `bson:"createdAt"`
	LastMessageAt   time.Time     `bson:"lastMessageAt"`
	Closed          bool          `bson:"closed"`
}

// InitDB initializes the MongoDB connection
func InitDB() error {
	mongoURI := os.Getenv("MONGODB_URI")
	if mongoURI == "" {
		return fmt.Errorf("MONGODB_URI environment variable not set")
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	// Configure connection pool (optimized for 500MB RAM limit)
	clientOptions := options.Client().
		ApplyURI(mongoURI).
		SetMaxPoolSize(20).            // Max 20 connections (low RAM)
		SetMinPoolSize(2).             // Keep 2 warm connections (low RAM)
		SetMaxConnIdleTime(30 * time.Second). // Close idle connections after 30s
		SetTimeout(10 * time.Second)   // Default operation timeout

	var err error
	client, err = mongo.Connect(clientOptions)
	if err != nil {
		return fmt.Errorf("failed to connect to MongoDB: %w", err)
	}

	if err := client.Ping(ctx, nil); err != nil {
		return fmt.Errorf("failed to ping MongoDB: %w", err)
	}

	database = client.Database("test")
	
	// Create indexes for performance
	if err := EnsureIndexes(); err != nil {
		log.Printf("Warning: Failed to create indexes: %v", err)
		// Don't fail startup, but log the issue
	}
	
	return nil
}

// CloseDB closes the MongoDB connection
func CloseDB() error {
	if client != nil {
		ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
		defer cancel()
		return client.Disconnect(ctx)
	}
	return nil
}

// GetGuildConfig fetches guild configuration from MongoDB
func GetGuildConfig(guildID string) (*GuildConfig, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	collection := database.Collection("servers")
	
	// First, let's see what raw data we get
	var rawResult bson.M
	err := collection.FindOne(ctx, bson.M{"serverId": guildID}).Decode(&rawResult)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			// Return default config if guild not found
			return &GuildConfig{
				GuildID: guildID,
				TicketConfig: TicketConfig{
					TicketNameStyle:   "number",
					MaxTicketsPerUser: 1,
					TicketPermissions: TicketPermissions{
						Attachments: true,
						Links:       true,
						Reactions:   true,
					},
					AutoClose: AutoClose{
						Enabled:             false,
						CloseWhenUserLeaves: false,
					},
				},
			}, nil
		}
		return nil, fmt.Errorf("failed to fetch guild config: %w", err)
	}

	// Now decode into struct
	var config GuildConfig
	err = collection.FindOne(ctx, bson.M{"serverId": guildID}).Decode(&config)
	if err != nil {
		return nil, err
	}

	return &config, nil
}

// GetUserActiveTicketCount returns the number of active tickets for a user in a guild
func GetUserActiveTicketCount(guildID, userID string) (int, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	collection := database.Collection("tickets")
	
	count, err := collection.CountDocuments(ctx, bson.M{
		"guildId": guildID,
		"userId":  userID,
		"closed":  false,
	})
	if err != nil {
		return 0, fmt.Errorf("failed to count user tickets: %w", err)
	}

	return int(count), nil
}

// CreateTicket creates a new ticket record in the database
func CreateTicket(ticket *Ticket) error {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	collection := database.Collection("tickets")
	ticket.CreatedAt = time.Now()
	ticket.LastMessageAt = time.Now()
	ticket.Closed = false

	result, err := collection.InsertOne(ctx, ticket)
	if err != nil {
		return fmt.Errorf("failed to create ticket: %w", err)
	}

	// Update ticket ID with the inserted ID
	if oid, ok := result.InsertedID.(bson.ObjectID); ok {
		ticket.ID = oid
	}

	return nil
}

// CloseTicket marks a ticket as closed
func CloseTicket(channelID string) error {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	collection := database.Collection("tickets")
	
	_, err := collection.UpdateOne(
		ctx,
		bson.M{"channelId": channelID},
		bson.M{"$set": bson.M{"closed": true}},
	)
	if err != nil {
		return fmt.Errorf("failed to close ticket: %w", err)
	}

	return nil
}

// UpdateTicketLastMessage updates the last message timestamp
func UpdateTicketLastMessage(channelID string) error {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	collection := database.Collection("tickets")
	
	_, err := collection.UpdateOne(
		ctx,
		bson.M{"channelId": channelID},
		bson.M{"$set": bson.M{"lastMessageAt": time.Now()}},
	)
	if err != nil {
		return fmt.Errorf("failed to update ticket: %w", err)
	}

	return nil
}

// GetInactiveTickets returns tickets that haven't had activity for the specified duration
// Uses pagination to avoid loading all tickets into memory
func GetInactiveTickets() ([]Ticket, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	collection := database.Collection("tickets")
	
	// Only fetch tickets older than 1 hour to reduce load
	oneHourAgo := time.Now().Add(-1 * time.Hour)
	
	var tickets []Ticket
	findOptions := options.Find().SetLimit(1000) // Process max 1000 tickets per cycle
	
	cursor, err := collection.Find(ctx, bson.M{
		"closed": false,
		"lastMessageAt": bson.M{"$lt": oneHourAgo},
	}, findOptions)
	if err != nil {
		return nil, fmt.Errorf("failed to fetch tickets: %w", err)
	}
	defer cursor.Close(ctx)

	if err := cursor.All(ctx, &tickets); err != nil {
		return nil, fmt.Errorf("failed to decode tickets: %w", err)
	}

	return tickets, nil
}

// GetTicketByChannel gets a ticket by channel ID
func GetTicketByChannel(channelID string) (*Ticket, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	collection := database.Collection("tickets")
	
	var ticket Ticket
	err := collection.FindOne(ctx, bson.M{"channelId": channelID}).Decode(&ticket)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			return nil, nil
		}
		return nil, fmt.Errorf("failed to fetch ticket: %w", err)
	}

	return &ticket, nil
}
