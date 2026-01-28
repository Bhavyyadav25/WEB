package main

import (
	"fmt"
	"log"
	"net/http"

	"portfolio-backend/internal/config"
	"portfolio-backend/internal/handler"
	"portfolio-backend/internal/middleware"
	"portfolio-backend/internal/service"
)

func main() {
	cfg := config.LoadFromEnv()

	// Services
	emailSvc := service.NewResendEmailService(cfg.ResendAPIKey, cfg.ToEmail)
	chatSvc := service.NewGroqChatService(cfg.GroqAPIKey)
	contactLog := service.NewFileContactLogger("contacts.log")

	// Handlers
	contactH := handler.NewContactHandler(emailSvc, contactLog)
	chatH := handler.NewChatHandler(chatSvc)
	healthH := handler.NewHealthHandler()
	visitorH := handler.NewVisitorHandler()

	go visitorH.RunHub()

	// Routes
	mux := http.NewServeMux()
	mux.HandleFunc("/api/contact", middleware.CORS(contactH.Handle))
	mux.HandleFunc("/api/chat", middleware.CORS(chatH.Handle))
	mux.HandleFunc("/api/health", middleware.CORS(healthH.Handle))
	mux.HandleFunc("/ws/visitors", visitorH.Handle)
	mux.HandleFunc("/", middleware.CORS(healthH.Handle))

	addr := fmt.Sprintf(":%s", cfg.Port)
	log.Printf("Server starting on http://localhost%s", addr)
	log.Printf("Endpoints: /api/contact, /api/chat, /api/health, /ws/visitors")

	if err := http.ListenAndServe(addr, mux); err != nil {
		log.Fatalf("Server failed: %v", err)
	}
}
