package config

import (
	"os"

	"github.com/gookit/slog"
)

// Config holds application configuration loaded from environment variables.
type Config struct {
	Port         string
	ToEmail      string
	GroqAPIKey   string
	ResendAPIKey string
}

// LoadFromEnv reads configuration from environment variables with sensible defaults.
func LoadFromEnv() Config {
	cfg := Config{
		Port:         getEnv("PORT", "8080"),
		ToEmail:      getEnv("TO_EMAIL", "yadavbhavy25@gmail.com"),
		GroqAPIKey:   getEnv("GROQ_API_KEY", ""),
		ResendAPIKey: getEnv("RESEND_API_KEY", ""),
	}

	slog.WithData(slog.M{
		"port":    cfg.Port,
		"toEmail": cfg.ToEmail,
		"groq":    cfg.GroqAPIKey != "",
		"resend":  cfg.ResendAPIKey != "",
	}).Info("Config loaded")

	return cfg
}

func getEnv(key, fallback string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return fallback
}
