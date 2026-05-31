package api

import (
	"context"
	"log"
	"time"
)

func (s *Server) startSessionCleanup(interval time.Duration) {
	if s.DB == nil {
		return
	}
	go func() {
		ticker := time.NewTicker(interval)
		defer ticker.Stop()

		s.cleanupExpiredSessions()
		for range ticker.C {
			s.cleanupExpiredSessions()
		}
	}()
}

func (s *Server) cleanupExpiredSessions() {
	if s.DB == nil {
		return
	}
	now := time.Now().Unix()
	if err := s.DB.DeleteExpiredAuthSessions(context.Background(), now); err != nil {
		log.Printf("session cleanup failed: %v", err)
	}
}
