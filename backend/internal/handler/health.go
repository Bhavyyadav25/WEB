package handler

import (
	"net/http"
	"time"

	"portfolio-backend/internal/httputil"
	"portfolio-backend/internal/model"
)

// HealthHandler serves health-check responses.
type HealthHandler struct{}

func NewHealthHandler() *HealthHandler { return &HealthHandler{} }

func (h *HealthHandler) Handle(w http.ResponseWriter, r *http.Request) {
	httputil.SendJSON(w, http.StatusOK, model.APIResponse{
		Success: true,
		Message: "Server is healthy",
		Data: map[string]any{
			"timestamp": time.Now().Unix(),
			"status":    "ok",
		},
	})
}
