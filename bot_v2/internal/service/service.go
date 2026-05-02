package service

import (
	"github.com/Sush1sui/FNS_BOT/internal/db"
	"github.com/Sush1sui/FNS_BOT/internal/storage"
)

type Service struct {
	queries *db.Queries
	storage storage.Client
}

// New creates a new Service with the given queries and storage.
func New(queries *db.Queries, stor storage.Client) *Service {
	return &Service{
		queries: queries,
		storage: stor,
	}
}

// Queries returns the underlying DB queries object.
// Can be used for direct DB calls if needed.
func (s *Service) Queries() *db.Queries {
	return s.queries
}

// Storage returns the underlying Storage implementation.
func (s *Service) Storage() storage.Client {
	return s.storage
}
