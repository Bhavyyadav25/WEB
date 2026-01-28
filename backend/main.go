package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"strings"
	"sync"
	"time"

	"github.com/gorilla/websocket"
)

// Config holds application configuration
type Config struct {
	Port         string
	ToEmail      string
	GroqAPIKey   string
	ResendAPIKey string
}

// ContactRequest represents a contact form submission
type ContactRequest struct {
	Name    string `json:"name"`
	Email   string `json:"email"`
	Subject string `json:"subject"`
	Message string `json:"message"`
}

// ChatRequest represents a chat message
type ChatRequest struct {
	Message string `json:"message"`
	History []struct {
		Role    string `json:"role"`
		Content string `json:"content"`
	} `json:"history"`
}

// APIResponse is a generic API response
type APIResponse struct {
	Success bool   `json:"success"`
	Message string `json:"message"`
	Data    any    `json:"data,omitempty"`
}

var config Config

// WebSocket upgrader
var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
	CheckOrigin: func(r *http.Request) bool {
		return true // Allow all origins for now
	},
}

// VisitorHub manages active WebSocket connections
type VisitorHub struct {
	clients    map[*websocket.Conn]bool
	broadcast  chan int
	register   chan *websocket.Conn
	unregister chan *websocket.Conn
	mu         sync.RWMutex
}

var visitorHub = &VisitorHub{
	clients:    make(map[*websocket.Conn]bool),
	broadcast:  make(chan int),
	register:   make(chan *websocket.Conn),
	unregister: make(chan *websocket.Conn),
}

// Run starts the visitor hub
func (h *VisitorHub) Run() {
	for {
		select {
		case conn := <-h.register:
			h.mu.Lock()
			h.clients[conn] = true
			count := len(h.clients)
			h.mu.Unlock()
			log.Printf("New visitor connected. Total: %d", count)
			h.broadcastCount(count)

		case conn := <-h.unregister:
			h.mu.Lock()
			if _, ok := h.clients[conn]; ok {
				delete(h.clients, conn)
				conn.Close()
			}
			count := len(h.clients)
			h.mu.Unlock()
			log.Printf("Visitor disconnected. Total: %d", count)
			h.broadcastCount(count)

		case count := <-h.broadcast:
			h.broadcastCount(count)
		}
	}
}

// broadcastCount sends the current visitor count to all connected clients
func (h *VisitorHub) broadcastCount(count int) {
	h.mu.RLock()
	defer h.mu.RUnlock()

	message := map[string]int{"count": count}
	jsonMsg, _ := json.Marshal(message)

	for conn := range h.clients {
		err := conn.WriteMessage(websocket.TextMessage, jsonMsg)
		if err != nil {
			log.Printf("Error broadcasting to client: %v", err)
			conn.Close()
			delete(h.clients, conn)
		}
	}
}

// GetCount returns current visitor count
func (h *VisitorHub) GetCount() int {
	h.mu.RLock()
	defer h.mu.RUnlock()
	return len(h.clients)
}

func main() {
	// Load configuration from environment
	config = Config{
		Port:         getEnv("PORT", "8080"),
		ToEmail:      getEnv("TO_EMAIL", "yadavbhavy25@gmail.com"),
		GroqAPIKey:   getEnv("GROQ_API_KEY", ""),
		ResendAPIKey: getEnv("RESEND_API_KEY", ""),
	}

	log.Printf("Resend API Key configured: %v", config.ResendAPIKey != "")

	// Start visitor hub
	go visitorHub.Run()

	// Create router
	mux := http.NewServeMux()

	// API routes
	mux.HandleFunc("/api/contact", corsMiddleware(handleContact))
	mux.HandleFunc("/api/chat", corsMiddleware(handleChat))
	mux.HandleFunc("/api/health", corsMiddleware(handleHealth))
	mux.HandleFunc("/ws/visitors", handleVisitorWebSocket)
	mux.HandleFunc("/", corsMiddleware(handleHealth)) // Root health check

	// Start server
	addr := fmt.Sprintf(":%s", config.Port)
	log.Printf("Server starting on http://localhost%s", addr)
	log.Printf("API endpoints available at /api/contact, /api/chat, /api/health, /ws/visitors")

	if err := http.ListenAndServe(addr, mux); err != nil {
		log.Fatalf("Server failed to start: %v", err)
	}
}

// CORS middleware
func corsMiddleware(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type")

		if r.Method == "OPTIONS" {
			w.WriteHeader(http.StatusOK)
			return
		}

		next(w, r)
	}
}

// Health check endpoint
func handleHealth(w http.ResponseWriter, r *http.Request) {
	response := APIResponse{
		Success: true,
		Message: "Server is healthy",
		Data: map[string]interface{}{
			"timestamp": time.Now().Unix(),
			"status":    "ok",
		},
	}
	sendJSON(w, http.StatusOK, response)
}

// Contact form handler
func handleContact(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		sendJSON(w, http.StatusMethodNotAllowed, APIResponse{
			Success: false,
			Message: "Method not allowed",
		})
		return
	}

	var req ContactRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		sendJSON(w, http.StatusBadRequest, APIResponse{
			Success: false,
			Message: "Invalid request body",
		})
		return
	}

	// Validate required fields
	if req.Name == "" || req.Email == "" || req.Message == "" {
		sendJSON(w, http.StatusBadRequest, APIResponse{
			Success: false,
			Message: "Name, email, and message are required",
		})
		return
	}

	// Basic email validation
	if !strings.Contains(req.Email, "@") {
		sendJSON(w, http.StatusBadRequest, APIResponse{
			Success: false,
			Message: "Invalid email address",
		})
		return
	}

	// Log the contact request
	log.Printf("New contact: %s <%s> - %s", req.Name, req.Email, req.Subject)

	// Store contact in a simple log file (do this first, it's fast)
	if err := logContact(req); err != nil {
		log.Printf("Failed to log contact: %v", err)
	}

	// Send response immediately - don't make user wait for email
	sendJSON(w, http.StatusOK, APIResponse{
		Success: true,
		Message: "Message received! I'll get back to you soon.",
	})

	// Try to send email asynchronously via Resend
	if config.ResendAPIKey != "" {
		go func(contact ContactRequest) {
			if err := sendEmailResend(contact); err != nil {
				log.Printf("[RESEND] Failed to send email: %v", err)
			} else {
				log.Printf("[RESEND] Email sent successfully for contact: %s", contact.Email)
			}
		}(req)
	} else {
		log.Printf("[EMAIL] Skipped: RESEND_API_KEY not configured")
	}
}

// Chat handler with AI integration
func handleChat(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		sendJSON(w, http.StatusMethodNotAllowed, APIResponse{
			Success: false,
			Message: "Method not allowed",
		})
		return
	}

	var req ChatRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		sendJSON(w, http.StatusBadRequest, APIResponse{
			Success: false,
			Message: "Invalid request body",
		})
		return
	}

	if req.Message == "" {
		sendJSON(w, http.StatusBadRequest, APIResponse{
			Success: false,
			Message: "Message is required",
		})
		return
	}

	var response string

	// If Groq API key is configured, use AI
	if config.GroqAPIKey != "" {
		aiResponse, err := callGroqAPI(req.Message, req.History)
		if err != nil {
			log.Printf("Groq API error: %v", err)
			response = getLocalResponse(req.Message)
		} else {
			response = aiResponse
		}
	} else {
		// Use local intelligent responses
		response = getLocalResponse(req.Message)
	}

	sendJSON(w, http.StatusOK, APIResponse{
		Success: true,
		Message: "Response generated",
		Data: map[string]string{
			"response": response,
		},
	})
}

// WebSocket handler for live visitor tracking
func handleVisitorWebSocket(w http.ResponseWriter, r *http.Request) {
	// Set CORS headers for WebSocket
	w.Header().Set("Access-Control-Allow-Origin", "*")

	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Printf("WebSocket upgrade error: %v", err)
		return
	}

	// Register new client
	visitorHub.register <- conn

	// Send current count immediately
	count := visitorHub.GetCount()
	message := map[string]int{"count": count}
	jsonMsg, _ := json.Marshal(message)
	conn.WriteMessage(websocket.TextMessage, jsonMsg)

	// Keep connection alive and handle disconnection
	go func() {
		defer func() {
			visitorHub.unregister <- conn
		}()

		for {
			// Read messages (primarily to detect disconnection)
			_, _, err := conn.ReadMessage()
			if err != nil {
				if websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway, websocket.CloseAbnormalClosure) {
					log.Printf("WebSocket error: %v", err)
				}
				break
			}
		}
	}()
}

// Call Groq API for AI responses
func callGroqAPI(message string, history []struct {
	Role    string `json:"role"`
	Content string `json:"content"`
}) (string, error) {
	// System prompt with Bhavy's information
	systemPrompt := `You are an AI assistant on Bhavy Yadav's portfolio website. You help visitors learn about Bhavy.

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

	// Build messages array
	messages := []map[string]string{
		{"role": "system", "content": systemPrompt},
	}

	for _, h := range history {
		messages = append(messages, map[string]string{
			"role":    h.Role,
			"content": h.Content,
		})
	}

	messages = append(messages, map[string]string{
		"role":    "user",
		"content": message,
	})

	// Prepare request body
	requestBody := map[string]interface{}{
		"model":       "llama3-8b-8192",
		"messages":    messages,
		"temperature": 0.7,
		"max_tokens":  500,
	}

	jsonBody, err := json.Marshal(requestBody)
	if err != nil {
		return "", err
	}

	// Make request to Groq API
	req, err := http.NewRequest("POST", "https://api.groq.com/openai/v1/chat/completions", strings.NewReader(string(jsonBody)))
	if err != nil {
		return "", err
	}

	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer "+config.GroqAPIKey)

	client := &http.Client{Timeout: 30 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		return "", err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return "", fmt.Errorf("groq API returned status %d", resp.StatusCode)
	}

	var result struct {
		Choices []struct {
			Message struct {
				Content string `json:"content"`
			} `json:"message"`
		} `json:"choices"`
	}

	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return "", err
	}

	if len(result.Choices) == 0 {
		return "", fmt.Errorf("no response from Groq API")
	}

	return result.Choices[0].Message.Content, nil
}

// Local response generator (fallback when no API key)
func getLocalResponse(message string) string {
	msg := strings.ToLower(message)

	// Skills
	if containsAny(msg, []string{"skill", "tech", "programming", "language", "expertise"}) {
		return "Bhavy is skilled in Go, Java, Python, and C++. He specializes in backend development, microservices, and cybersecurity systems. His expertise includes building WAFs, DDoS protection, and high-throughput APIs."
	}

	// Experience
	if containsAny(msg, []string{"experience", "work", "job", "career"}) {
		return "Bhavy currently works at Clickpost as an SDE, building store management and delivery systems. Previously at WiJungle, he built security systems including DDoS protection and WAF that protected 50+ websites."
	}

	// Projects
	if containsAny(msg, []string{"project", "built", "created"}) {
		return "Notable projects include: DDoS Protection System (Go), Web Application Firewall, Store Master System (Java), GraphQL Parser (C++), and Log Analysis System. Each handles enterprise-scale workloads."
	}

	// Contact
	if containsAny(msg, []string{"contact", "email", "hire", "reach"}) {
		return "You can reach Bhavy at yadavbhavy25@gmail.com or +91 7303345356. He's on LinkedIn (yadavbhavy) and GitHub (bhavy). He's open to freelance projects and opportunities!"
	}

	// Education
	if containsAny(msg, []string{"education", "college", "iit", "study"}) {
		return "Bhavy graduated from IIT Delhi with a B.Tech in Fiber Science & Nanotechnology (2019-2023). He was also the badminton team captain and won a state gold medal!"
	}

	// Default
	return "I can help you learn about Bhavy's skills, experience, projects, or how to contact him. What would you like to know?"
}

// Send email via Resend HTTP API
func sendEmailResend(req ContactRequest) error {
	log.Printf("[RESEND] Sending email to %s", config.ToEmail)

	subject := fmt.Sprintf("Portfolio Contact: %s", req.Subject)
	htmlBody := fmt.Sprintf(
		"<h2>New Contact from Portfolio</h2>"+
			"<p><strong>Name:</strong> %s</p>"+
			"<p><strong>Email:</strong> %s</p>"+
			"<p><strong>Subject:</strong> %s</p>"+
			"<hr>"+
			"<p><strong>Message:</strong></p>"+
			"<p>%s</p>",
		req.Name, req.Email, req.Subject, strings.ReplaceAll(req.Message, "\n", "<br>"))

	// Resend API payload
	payload := map[string]interface{}{
		"from":     "Portfolio <onboarding@resend.dev>",
		"to":       []string{config.ToEmail},
		"reply_to": req.Email,
		"subject":  subject,
		"html":     htmlBody,
	}

	jsonPayload, err := json.Marshal(payload)
	if err != nil {
		return fmt.Errorf("failed to marshal payload: %v", err)
	}

	log.Printf("[RESEND] Sending request to Resend API...")

	httpReq, err := http.NewRequest("POST", "https://api.resend.com/emails", bytes.NewBuffer(jsonPayload))
	if err != nil {
		return fmt.Errorf("failed to create request: %v", err)
	}

	httpReq.Header.Set("Content-Type", "application/json")
	httpReq.Header.Set("Authorization", "Bearer "+config.ResendAPIKey)

	client := &http.Client{Timeout: 10 * time.Second}
	resp, err := client.Do(httpReq)
	if err != nil {
		return fmt.Errorf("request failed: %v", err)
	}
	defer resp.Body.Close()

	respBody, _ := io.ReadAll(resp.Body)
	log.Printf("[RESEND] Response status: %d, body: %s", resp.StatusCode, string(respBody))

	if resp.StatusCode != http.StatusOK && resp.StatusCode != http.StatusCreated {
		return fmt.Errorf("Resend API returned status %d: %s", resp.StatusCode, string(respBody))
	}

	return nil
}

// Log contact to file
func logContact(req ContactRequest) error {
	f, err := os.OpenFile("contacts.log", os.O_APPEND|os.O_CREATE|os.O_WRONLY, 0644)
	if err != nil {
		return err
	}
	defer f.Close()

	logEntry := fmt.Sprintf("[%s] %s <%s> - %s: %s\n",
		time.Now().Format(time.RFC3339),
		req.Name, req.Email, req.Subject, req.Message)

	_, err = f.WriteString(logEntry)
	return err
}

// Helper: Send JSON response
func sendJSON(w http.ResponseWriter, status int, data interface{}) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	json.NewEncoder(w).Encode(data)
}

// Helper: Get environment variable with default
func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}

// Helper: Check if string contains any of the keywords
func containsAny(s string, keywords []string) bool {
	for _, k := range keywords {
		if strings.Contains(s, k) {
			return true
		}
	}
	return false
}
