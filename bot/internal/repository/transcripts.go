package repository

import (
	"context"
	"fmt"
	"time"

	"go.mongodb.org/mongo-driver/v2/bson"
	"go.mongodb.org/mongo-driver/v2/mongo"
	"go.mongodb.org/mongo-driver/v2/mongo/options"
)

// TranscriptMessage represents a single message in a transcript
type TranscriptMessage struct {
	ID       string              `bson:"id"`
	Type     string              `bson:"type"` // message, embed, attachment, voice_join, voice_leave, system
	Author   TranscriptAuthor    `bson:"author"`
	Content  *string             `bson:"content"`
	Timestamp time.Time          `bson:"timestamp"`
	Embeds   []TranscriptEmbed   `bson:"embeds,omitempty"`
	Attachments []TranscriptAttachment `bson:"attachments,omitempty"`
	Edited   bool                `bson:"edited"`
	EditedTimestamp *time.Time   `bson:"editedTimestamp"`
	Reactions []TranscriptReaction `bson:"reactions,omitempty"`
}

type TranscriptAuthor struct {
	ID            string `bson:"id"`
	Username      string `bson:"username"`
	Discriminator string `bson:"discriminator"`
	Avatar        *string `bson:"avatar"`
	Bot           bool   `bson:"bot"`
}

type TranscriptEmbed struct {
	Title       *string               `bson:"title"`
	Description *string               `bson:"description"`
	URL         *string               `bson:"url"`
	Color       *int                  `bson:"color"`
	Fields      []TranscriptEmbedField `bson:"fields"`
	Image       *TranscriptImage      `bson:"image"`
	Thumbnail   *TranscriptImage      `bson:"thumbnail"`
	Footer      *TranscriptFooter     `bson:"footer"`
	Author      *TranscriptEmbedAuthor `bson:"author"`
}

type TranscriptEmbedField struct {
	Name   string `bson:"name"`
	Value  string `bson:"value"`
	Inline bool   `bson:"inline"`
}

type TranscriptImage struct {
	URL string `bson:"url"`
}

type TranscriptFooter struct {
	Text    string  `bson:"text"`
	IconURL *string `bson:"iconUrl"`
}

type TranscriptEmbedAuthor struct {
	Name    string  `bson:"name"`
	URL     *string `bson:"url"`
	IconURL *string `bson:"iconUrl"`
}

type TranscriptAttachment struct {
	ID          string  `bson:"id"`
	Filename    string  `bson:"filename"`
	URL         string  `bson:"url"`
	ProxyURL    string  `bson:"proxyUrl"`
	Size        int     `bson:"size"`
	ContentType *string `bson:"contentType"`
	Width       *int    `bson:"width"`
	Height      *int    `bson:"height"`
}

type TranscriptReaction struct {
	Emoji string `bson:"emoji"`
	Count int    `bson:"count"`
}

// VoiceActivity represents voice channel activity
type VoiceActivity struct {
	UserID   string     `bson:"userId"`
	Username string     `bson:"username"`
	JoinedAt time.Time  `bson:"joinedAt"`
	LeftAt   *time.Time `bson:"leftAt"`
	Duration int        `bson:"duration"` // in seconds
}

// TranscriptMetadata contains summary information about the transcript
type TranscriptMetadata struct {
	TicketOpenedAt   time.Time                  `bson:"ticketOpenedAt"`
	TicketClosedAt   time.Time                  `bson:"ticketClosedAt"`
	ClosedBy         TranscriptClosedBy         `bson:"closedBy"`
	TotalMessages    int                        `bson:"totalMessages"`
	TotalAttachments int                        `bson:"totalAttachments"`
	TotalEmbeds      int                        `bson:"totalEmbeds"`
	Participants     []TranscriptParticipant    `bson:"participants"`
}

type TranscriptClosedBy struct {
	ID       string `bson:"id"`
	Username string `bson:"username"`
}

type TranscriptParticipant struct {
	ID           string `bson:"id"`
	Username     string `bson:"username"`
	MessageCount int    `bson:"messageCount"`
}

// Transcript represents a complete ticket transcript
type Transcript struct {
	ID            bson.ObjectID       `bson:"_id,omitempty"`
	TicketID      string              `bson:"ticketId"`
	GuildID       string              `bson:"guildId"`
	ChannelID     string              `bson:"channelId"`
	PanelID       string              `bson:"panelId"`
	UserID        string              `bson:"userId"`
	Username      string              `bson:"username"`
	TicketNumber  int                 `bson:"ticketNumber"`
	Messages      []TranscriptMessage `bson:"messages"`
	VoiceActivity []VoiceActivity     `bson:"voiceActivity,omitempty"`
	Metadata      TranscriptMetadata  `bson:"metadata"`
	CreatedAt     time.Time           `bson:"createdAt"`
	UpdatedAt     time.Time           `bson:"updatedAt"`
}

// CreateTranscript creates a new transcript in the database
func CreateTranscript(transcript *Transcript) error {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	collection := database.Collection("transcripts")
	
	transcript.CreatedAt = time.Now()
	transcript.UpdatedAt = time.Now()

	_, err := collection.InsertOne(ctx, transcript)
	if err != nil {
		return fmt.Errorf("failed to create transcript: %w", err)
	}

	return nil
}

// AddMessageToTranscript adds a message to an existing transcript
func AddMessageToTranscript(ticketID string, message TranscriptMessage) error {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	collection := database.Collection("transcripts")
	
	_, err := collection.UpdateOne(
		ctx,
		bson.M{"ticketId": ticketID},
		bson.M{
			"$push": bson.M{"messages": message},
			"$set":  bson.M{"updatedAt": time.Now()},
		},
	)
	if err != nil {
		return fmt.Errorf("failed to add message to transcript: %w", err)
	}

	return nil
}

// UpdateTranscriptMetadata updates the metadata of a transcript
func UpdateTranscriptMetadata(ticketID string, metadata TranscriptMetadata) error {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	collection := database.Collection("transcripts")
	
	_, err := collection.UpdateOne(
		ctx,
		bson.M{"ticketId": ticketID},
		bson.M{
			"$set": bson.M{
				"metadata":  metadata,
				"updatedAt": time.Now(),
			},
		},
	)
	if err != nil {
		return fmt.Errorf("failed to update transcript metadata: %w", err)
	}

	return nil
}

// AddVoiceActivity adds voice activity to a transcript
func AddVoiceActivity(ticketID string, activity VoiceActivity) error {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	collection := database.Collection("transcripts")
	
	_, err := collection.UpdateOne(
		ctx,
		bson.M{"ticketId": ticketID},
		bson.M{
			"$push": bson.M{"voiceActivity": activity},
			"$set":  bson.M{"updatedAt": time.Now()},
		},
	)
	if err != nil {
		return fmt.Errorf("failed to add voice activity to transcript: %w", err)
	}

	return nil
}

// GetTranscript retrieves a transcript by ticket ID
func GetTranscript(ticketID string) (*Transcript, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	collection := database.Collection("transcripts")
	
	var transcript Transcript
	err := collection.FindOne(ctx, bson.M{"ticketId": ticketID}).Decode(&transcript)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			return nil, nil
		}
		return nil, fmt.Errorf("failed to get transcript: %w", err)
	}

	return &transcript, nil
}

// GetTranscriptsByGuild retrieves all transcripts for a guild with pagination
func GetTranscriptsByGuild(guildID string, skip, limit int) ([]Transcript, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	collection := database.Collection("transcripts")
	
	findOptions := options.Find().
		SetSkip(int64(skip)).
		SetLimit(int64(limit)).
		SetSort(bson.M{"createdAt": -1})
	
	var transcripts []Transcript
	cursor, err := collection.Find(ctx, bson.M{"guildId": guildID}, findOptions)
	if err != nil {
		return nil, fmt.Errorf("failed to fetch transcripts: %w", err)
	}
	defer cursor.Close(ctx)

	if err := cursor.All(ctx, &transcripts); err != nil {
		return nil, fmt.Errorf("failed to decode transcripts: %w", err)
	}

	return transcripts, nil
}

// SearchTranscripts searches for transcripts with filters
func SearchTranscripts(guildID, userID, panelID string, skip, limit int) ([]Transcript, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	collection := database.Collection("transcripts")
	
	filter := bson.M{"guildId": guildID}
	if userID != "" {
		filter["userId"] = userID
	}
	if panelID != "" {
		filter["panelId"] = panelID
	}
	
	findOptions := options.Find().
		SetSkip(int64(skip)).
		SetLimit(int64(limit)).
		SetSort(bson.M{"createdAt": -1})
	
	var transcripts []Transcript
	cursor, err := collection.Find(ctx, filter, findOptions)
	if err != nil {
		return nil, fmt.Errorf("failed to search transcripts: %w", err)
	}
	defer cursor.Close(ctx)

	if err := cursor.All(ctx, &transcripts); err != nil {
		return nil, fmt.Errorf("failed to decode transcripts: %w", err)
	}

	return transcripts, nil
}

// CountTranscripts counts total transcripts for a guild
func CountTranscripts(guildID string) (int64, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	collection := database.Collection("transcripts")
	
	count, err := collection.CountDocuments(ctx, bson.M{"guildId": guildID})
	if err != nil {
		return 0, fmt.Errorf("failed to count transcripts: %w", err)
	}

	return count, nil
}

// CreateTranscriptFromTicket creates a transcript from ticket channel messages
// This is called when a ticket is closed
func CreateTranscriptFromTicket(ticket *Ticket, messages []TranscriptMessage, closedBy TranscriptClosedBy) error {
	// Calculate metadata
	participantMap := make(map[string]*TranscriptParticipant)
	totalAttachments := 0
	totalEmbeds := 0

	for _, msg := range messages {
		// Count participants
		if _, exists := participantMap[msg.Author.ID]; !exists {
			participantMap[msg.Author.ID] = &TranscriptParticipant{
				ID:           msg.Author.ID,
				Username:     msg.Author.Username,
				MessageCount: 0,
			}
		}
		participantMap[msg.Author.ID].MessageCount++

		// Count attachments and embeds
		totalAttachments += len(msg.Attachments)
		totalEmbeds += len(msg.Embeds)
	}

	// Convert participant map to slice
	participants := make([]TranscriptParticipant, 0, len(participantMap))
	for _, p := range participantMap {
		participants = append(participants, *p)
	}

	transcript := &Transcript{
		TicketID:     ticket.ID.Hex(),
		GuildID:      ticket.GuildID,
		ChannelID:    ticket.ChannelID,
		PanelID:      ticket.PanelID,
		UserID:       ticket.UserID,
		Username:     "", // Will be filled from first message or user lookup
		TicketNumber: 0,  // Should be passed from ticket creation
		Messages:     messages,
		Metadata: TranscriptMetadata{
			TicketOpenedAt:   ticket.CreatedAt,
			TicketClosedAt:   time.Now(),
			ClosedBy:         closedBy,
			TotalMessages:    len(messages),
			TotalAttachments: totalAttachments,
			TotalEmbeds:      totalEmbeds,
			Participants:     participants,
		},
	}

	return CreateTranscript(transcript)
}
