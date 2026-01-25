package repository

import (
	"context"
	"fmt"
	"time"

	"go.mongodb.org/mongo-driver/v2/bson"
	"go.mongodb.org/mongo-driver/v2/mongo"
)

// GetPanelQuestionPrompts fetches the panel document by id and returns the question prompts.
// Returns (nil, nil) if the panel doesn't exist or has no questions configured.
func GetPanelQuestionPrompts(panelID string) ([]string, error) {
    ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
    defer cancel()

    collection := database.Collection("panels")
	
    // Match by literal _id (string) OR by stringified ObjectID using $expr + $toString.
    filter := bson.M{
        "$or": []interface{}{
            bson.M{"_id": panelID},
            bson.M{"$expr": bson.M{"$eq": []interface{}{bson.M{"$toString": "$_id"}, panelID}}},
        },
    }

    // Decode into a typed struct matching the document shape
    var doc struct {
        Questions *struct {
            AskQuestions bool `bson:"askQuestions"`
            Questions    []struct {
                ID     string `bson:"id"`
                Prompt string `bson:"prompt"`
            } `bson:"questions"`
        } `bson:"questions"`
    }

    err := collection.FindOne(ctx, filter).Decode(&doc)
    if err != nil {
        if err == mongo.ErrNoDocuments {
            return nil, nil
        }
        return nil, fmt.Errorf("failed to fetch panel: %w", err)
    }

    if doc.Questions == nil || !doc.Questions.AskQuestions || len(doc.Questions.Questions) == 0 {
        return nil, nil
    }

    prompts := make([]string, 0, len(doc.Questions.Questions))
    for _, q := range doc.Questions.Questions {
        if q.Prompt != "" {
            prompts = append(prompts, q.Prompt)
        }
    }

    if len(prompts) == 0 {
        return nil, nil
    }

    return prompts, nil
}
