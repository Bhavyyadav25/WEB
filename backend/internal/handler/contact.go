package handler

import (
	"encoding/json"
	"log"
	"net/http"
	"strings"

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
		httputil.SendJSON(w, http.StatusBadRequest, model.APIResponse{
			Success: false, Message: "Invalid request body",
		})
		return
	}

	if req.Name == "" || req.Email == "" || req.Message == "" {
		httputil.SendJSON(w, http.StatusBadRequest, model.APIResponse{
			Success: false, Message: "Name, email, and message are required",
		})
		return
	}

	if !strings.Contains(req.Email, "@") {
		httputil.SendJSON(w, http.StatusBadRequest, model.APIResponse{
			Success: false, Message: "Invalid email address",
		})
		return
	}

	log.Printf("New contact: %s <%s> - %s", req.Name, req.Email, req.Subject)

	if err := h.logger.Log(req); err != nil {
		log.Printf("Failed to log contact: %v", err)
	}

	// Respond immediately; send email in background.
	httputil.SendJSON(w, http.StatusOK, model.APIResponse{
		Success: true, Message: "Message received! I'll get back to you soon.",
	})

	go func() {
		if err := h.email.Send(req); err != nil {
			log.Printf("Failed to send email: %v", err)
		} else {
			log.Printf("Email sent for contact: %s", req.Email)
		}
	}()
}
