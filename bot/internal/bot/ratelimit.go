package bot

import (
	"fmt"
	"log"
	"strconv"
	"time"

	"github.com/bwmarrin/discordgo"
)

// RateLimitHandler wraps Discord API calls with automatic retry on rate limits
type RateLimitHandler struct {
	session *discordgo.Session
}

// NewRateLimitHandler creates a new rate limit handler
func NewRateLimitHandler(s *discordgo.Session) *RateLimitHandler {
	return &RateLimitHandler{session: s}
}

// ChannelMessageSendWithRetry sends a message with automatic retry on rate limits
func (r *RateLimitHandler) ChannelMessageSendWithRetry(channelID, content string) (*discordgo.Message, error) {
	maxRetries := 3

	for attempt := 0; attempt <= maxRetries; attempt++ {
		msg, err := r.session.ChannelMessageSend(channelID, content)
		if err == nil {
			return msg, nil
		}

		// Check if it's a rate limit error
		if restErr, ok := err.(*discordgo.RESTError); ok {
			if restErr.Response != nil && restErr.Response.StatusCode == 429 {
				// Extract retry-after from response
				retryAfter := 1.0
				if retryAfterStr := restErr.Response.Header.Get("Retry-After"); retryAfterStr != "" {
					if parsed, err := strconv.ParseFloat(retryAfterStr, 64); err == nil {
						retryAfter = parsed
					}
				}

				waitDuration := time.Duration(retryAfter*1000) * time.Millisecond
				log.Printf("Rate limited, waiting %v before retry (attempt %d/%d)", waitDuration, attempt+1, maxRetries)
				time.Sleep(waitDuration)
				continue
			}
		}

		// Not a rate limit error or max retries exceeded
		return nil, err
	}

	return nil, fmt.Errorf("max retries exceeded")
}

// ChannelMessageSendComplexWithRetry sends a complex message with automatic retry
func (r *RateLimitHandler) ChannelMessageSendComplexWithRetry(channelID string, data *discordgo.MessageSend) (*discordgo.Message, error) {
	maxRetries := 3

	for attempt := 0; attempt <= maxRetries; attempt++ {
		msg, err := r.session.ChannelMessageSendComplex(channelID, data)
		if err == nil {
			return msg, nil
		}

		if restErr, ok := err.(*discordgo.RESTError); ok {
			if restErr.Response != nil && restErr.Response.StatusCode == 429 {
				retryAfter := 1.0
				if retryAfterStr := restErr.Response.Header.Get("Retry-After"); retryAfterStr != "" {
					if parsed, err := strconv.ParseFloat(retryAfterStr, 64); err == nil {
						retryAfter = parsed
					}
				}

				waitDuration := time.Duration(retryAfter*1000) * time.Millisecond
				log.Printf("Rate limited, waiting %v before retry (attempt %d/%d)", waitDuration, attempt+1, maxRetries)
				time.Sleep(waitDuration)
				continue
			}
		}

		return nil, err
	}

	return nil, fmt.Errorf("max retries exceeded")
}

// ChannelDeleteWithRetry deletes a channel with automatic retry
func (r *RateLimitHandler) ChannelDeleteWithRetry(channelID string) (*discordgo.Channel, error) {
	maxRetries := 3

	for attempt := 0; attempt <= maxRetries; attempt++ {
		channel, err := r.session.ChannelDelete(channelID)
		if err == nil {
			return channel, nil
		}

		if restErr, ok := err.(*discordgo.RESTError); ok {
			if restErr.Response != nil && restErr.Response.StatusCode == 429 {
				retryAfter := 1.0
				if retryAfterStr := restErr.Response.Header.Get("Retry-After"); retryAfterStr != "" {
					if parsed, err := strconv.ParseFloat(retryAfterStr, 64); err == nil {
						retryAfter = parsed
					}
				}

				waitDuration := time.Duration(retryAfter*1000) * time.Millisecond
				log.Printf("Rate limited, waiting %v before retry (attempt %d/%d)", waitDuration, attempt+1, maxRetries)
				time.Sleep(waitDuration)
				continue
			}
		}

		return nil, err
	}

	return nil, fmt.Errorf("max retries exceeded")
}
