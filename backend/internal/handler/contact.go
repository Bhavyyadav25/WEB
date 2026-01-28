package handler

import (
	"encoding/json"
	"net/http"
	"strings"

	"github.com/gookit/slog"

	"portfolio-backend/internal/httputil"
	"portfolio-backend/internal/model"
	"portfolio-backend/internal/service"
)

// ContactHandler processes contact form submissions.
type ContactHandler struct {
	email  service.EmailService
	logger service.ContactLogger
}

func NewContactHandler(email service.EmailService, logger service.ContactLogger) *ContactHandler {
	return &ContactHandler{email: email, logger: logger}
}

func (h *ContactHandler) Handle(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		httputil.SendJSON(w, http.StatusMethodNotAllowed, model.APIResponse{
			Success: false, Message: "Method not allowed",
		})
		return
	}

	var req model.ContactRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		slog.Warn("[contact] Invalid request body", "error", err)
		httputil.SendJSON(w, http.StatusBadRequest, model.APIResponse{
			Success: false, Message: "Invalid request body",
		})
		return
	}

	if req.Name == "" || req.Email == "" || req.Message == "" {
		slog.Warn("[contact] Missing required fields", "name", req.Name, "email", req.Email)
		httputil.SendJSON(w, http.StatusBadRequest, model.APIResponse{
			Success: false, Message: "Name, email, and message are required",
		})
		return
	}

	if !strings.Contains(req.Email, "@") {
		slog.Warn("[contact] Invalid email address", "email", req.Email)
		httputil.SendJSON(w, http.StatusBadRequest, model.APIResponse{
			Success: false, Message: "Invalid email address",
		})
		return
	}

	slog.WithData(slog.M{
		"name":    req.Name,
		"email":   req.Email,
		"subject": req.Subject,
	}).Info("[contact] New submission")

	if err := h.logger.Log(req); err != nil {
		slog.Error("[contact] Failed to log contact", "error", err)
	}

	// Respond immediately; send email in background.
	httputil.SendJSON(w, http.StatusOK, model.APIResponse{
		Success: true, Message: "Message received! I'll get back to you soon.",
	})

	go func() {
		if err := h.email.Send(req); err != nil {
			slog.Error("[contact] Failed to send email", "error", err, "email", req.Email)
		} else {
			slog.Info("[contact] Email sent successfully", "email", req.Email)
		}
	}()
}
