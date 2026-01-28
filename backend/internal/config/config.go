package config

import (
	"log"
	"os"
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

	log.Printf("Config loaded: port=%s, toEmail=%s, groq=%v, resend=%v",
		cfg.Port, cfg.ToEmail, cfg.GroqAPIKey != "", cfg.ResendAPIKey != "")

	return cfg
}

func getEnv(key, fallback string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return fallback
}
