package service

import (
	"encoding/json"
	"fmt"
	"net/http"
	"strings"
	"time"

	"github.com/gookit/slog"

	"portfolio-backend/internal/model"
)

// ChatService generates responses for visitor chat messages.
type ChatService interface {
	GetResponse(message string, history []model.ChatMessage) (string, error)
}

// GroqChatService calls the Groq LLM API for intelligent responses,
// falling back to keyword-based replies when no API key is configured.
type GroqChatService struct {
	apiKey string
	client *http.Client
}

// NewGroqChatService creates a ChatService backed by Groq.
// If apiKey is empty, all responses use the local fallback.
func NewGroqChatService(apiKey string) *GroqChatService {
	if apiKey == "" {
		slog.Warn("[chat] Groq API key not configured; using local responses")
	} else {
		slog.Info("[chat] Groq chat service initialized")
	}
	return &GroqChatService{
		apiKey: apiKey,
		client: &http.Client{Timeout: 30 * time.Second},
	}
}

func (s *GroqChatService) GetResponse(message string, history []model.ChatMessage) (string, error) {
	if s.apiKey == "" {
		slog.Debug("[chat] Using local fallback", "message", message)
		return localResponse(message), nil
	}

	slog.Debug("[chat] Calling Groq API", "message", message, "historyLen", len(history))

	resp, err := s.callAPI(message, history)
	if err != nil {
		slog.Error("[chat] Groq API error; falling back to local", "error", err)
		return localResponse(message), nil
	}

	slog.Trace("[chat] Groq response received", "responseLen", len(resp))
	return resp, nil
}

const systemPrompt = `You are an AI assistant on Bhavy Yadav's portfolio website. You help visitors learn about Bhavy.

ABOUT BHAVY:
- Software Development Engineer at Clickpost (current) and previously at WiJungle
- IIT Delhi graduate (B.Tech in Fiber Science & Nanotechnology, 2019-2023)
- Expert in Go, Java, Python, C++
- Specializes in backend development, microservices, and cybersecurity
- Built DDoS protection systems, WAF, and high-throughput APIs
- Contact: yadavbhavy25@gmail.com, +91 7303345356
- Based in Delhi, India
- Open to freelance projects and opportunities

KEY ACHIEVEMENTS:
- Protected 50+ client websites with WAF
- Built systems handling 100,000+ daily requests
- Reduced security breaches by 25%, detection time by 35%
- State gold medal winner in badminton at IIT Delhi

Be helpful, concise, and encourage visitors to contact Bhavy for opportunities.`

func (s *GroqChatService) callAPI(message string, history []model.ChatMessage) (string, error) {
	messages := []map[string]string{
		{"role": "system", "content": systemPrompt},
	}
	for _, h := range history {
		messages = append(messages, map[string]string{"role": h.Role, "content": h.Content})
	}
	messages = append(messages, map[string]string{"role": "user", "content": message})

	body := map[string]any{
		"model":       "llama3-8b-8192",
		"messages":    messages,
		"temperature": 0.7,
		"max_tokens":  500,
	}

	jsonBody, err := json.Marshal(body)
	if err != nil {
		return "", fmt.Errorf("marshal: %w", err)
	}

	req, err := http.NewRequest(http.MethodPost, "https://api.groq.com/openai/v1/chat/completions", strings.NewReader(string(jsonBody)))
	if err != nil {
		return "", fmt.Errorf("create request: %w", err)
	}
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer "+s.apiKey)

	resp, err := s.client.Do(req)
	if err != nil {
		return "", fmt.Errorf("request: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return "", fmt.Errorf("groq returned status %d", resp.StatusCode)
	}

	var result struct {
		Choices []struct {
			Message struct {
				Content string `json:"content"`
			} `json:"message"`
		} `json:"choices"`
	}
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return "", fmt.Errorf("decode: %w", err)
	}
	if len(result.Choices) == 0 {
		return "", fmt.Errorf("empty response from groq")
	}
	return result.Choices[0].Message.Content, nil
}

func localResponse(message string) string {
	msg := strings.ToLower(message)

	responses := []struct {
		keywords []string
		reply    string
	}{
		{
			[]string{"skill", "tech", "programming", "language", "expertise"},
			"Bhavy is skilled in Go, Java, Python, and C++. He specializes in backend development, microservices, and cybersecurity systems. His expertise includes building WAFs, DDoS protection, and high-throughput APIs.",
		},
		{
			[]string{"experience", "work", "job", "career"},
			"Bhavy currently works at Clickpost as an SDE, building store management and delivery systems. Previously at WiJungle, he built security systems including DDoS protection and WAF that protected 50+ websites.",
		},
		{
			[]string{"project", "built", "created"},
			"Notable projects include: DDoS Protection System (Go), Web Application Firewall, Store Master System (Java), GraphQL Parser (C++), and Log Analysis System. Each handles enterprise-scale workloads.",
		},
		{
			[]string{"contact", "email", "hire", "reach"},
			"You can reach Bhavy at yadavbhavy25@gmail.com or +91 7303345356. He's on LinkedIn (yadavbhavy) and GitHub (bhavy). He's open to freelance projects and opportunities!",
		},
		{
			[]string{"education", "college", "iit", "study"},
			"Bhavy graduated from IIT Delhi with a B.Tech in Fiber Science & Nanotechnology (2019-2023). He was also the badminton team captain and won a state gold medal!",
		},
	}

	for _, r := range responses {
		for _, kw := range r.keywords {
			if strings.Contains(msg, kw) {
				return r.reply
			}
		}
	}

	return "I can help you learn about Bhavy's skills, experience, projects, or how to contact him. What would you like to know?"
}
