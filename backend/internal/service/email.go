package service

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"strings"
	"time"

	"github.com/gookit/slog"

	"portfolio-backend/internal/model"
)

// EmailService sends notification emails for contact form submissions.
type EmailService interface {
	Send(req model.ContactRequest) error
}

// ResendEmailService delivers emails through the Resend HTTP API.
type ResendEmailService struct {
	apiKey  string
	toEmail string
	client  *http.Client
}

// NewResendEmailService creates an EmailService backed by Resend.
// If apiKey is empty, Send becomes a no-op.
func NewResendEmailService(apiKey, toEmail string) *ResendEmailService {
	if apiKey == "" {
		slog.Warn("[email] Resend API key not configured; emails will be skipped")
	} else {
		slog.Info("[email] Resend email service initialized", "toEmail", toEmail)
	}
	return &ResendEmailService{
		apiKey:  apiKey,
		toEmail: toEmail,
		client:  &http.Client{Timeout: 10 * time.Second},
	}
}

func (s *ResendEmailService) Send(req model.ContactRequest) error {
	if s.apiKey == "" {
		slog.Notice("[email] Skipped: no API key")
		return nil
	}

	subject := fmt.Sprintf("Portfolio Contact: %s", req.Subject)
	html := fmt.Sprintf(
		"<h2>New Contact from Portfolio</h2>"+
			"<p><strong>Name:</strong> %s</p>"+
			"<p><strong>Email:</strong> %s</p>"+
			"<p><strong>Subject:</strong> %s</p>"+
			"<hr>"+
			"<p><strong>Message:</strong></p>"+
			"<p>%s</p>",
		req.Name, req.Email, req.Subject,
		strings.ReplaceAll(req.Message, "\n", "<br>"))

	payload, err := json.Marshal(map[string]any{
		"from":     "Portfolio <onboarding@resend.dev>",
		"to":       []string{s.toEmail},
		"reply_to": req.Email,
		"subject":  subject,
		"html":     html,
	})
	if err != nil {
		return fmt.Errorf("marshal payload: %w", err)
	}

	slog.Debug("[email] Sending via Resend", "to", s.toEmail, "subject", subject)

	httpReq, err := http.NewRequest(http.MethodPost, "https://api.resend.com/emails", bytes.NewReader(payload))
	if err != nil {
		return fmt.Errorf("create request: %w", err)
	}
	httpReq.Header.Set("Content-Type", "application/json")
	httpReq.Header.Set("Authorization", "Bearer "+s.apiKey)

	resp, err := s.client.Do(httpReq)
	if err != nil {
		slog.Error("[email] Request failed", "error", err)
		return fmt.Errorf("request failed: %w", err)
	}
	defer resp.Body.Close()

	body, _ := io.ReadAll(resp.Body)
	slog.WithData(slog.M{
		"status": resp.StatusCode,
		"body":   string(body),
	}).Info("[email] Resend response")

	if resp.StatusCode != http.StatusOK && resp.StatusCode != http.StatusCreated {
		return fmt.Errorf("resend returned %d: %s", resp.StatusCode, body)
	}
	return nil
}
