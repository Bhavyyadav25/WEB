package service

import (
	"fmt"
	"os"
	"time"

	"portfolio-backend/internal/model"
)

// ContactLogger persists contact form submissions.
type ContactLogger interface {
	Log(req model.ContactRequest) error
}

// FileContactLogger appends contact entries to a file.
type FileContactLogger struct {
	filePath string
}

// NewFileContactLogger creates a ContactLogger that writes to the given file path.
func NewFileContactLogger(path string) *FileContactLogger {
	return &FileContactLogger{filePath: path}
}

func (l *FileContactLogger) Log(req model.ContactRequest) error {
	f, err := os.OpenFile(l.filePath, os.O_APPEND|os.O_CREATE|os.O_WRONLY, 0644)
	if err != nil {
		return fmt.Errorf("open log file: %w", err)
	}
	defer f.Close()

	entry := fmt.Sprintf("[%s] %s <%s> - %s: %s\n",
		time.Now().Format(time.RFC3339),
		req.Name, req.Email, req.Subject, req.Message)

	if _, err := f.WriteString(entry); err != nil {
		return fmt.Errorf("write log entry: %w", err)
	}
	return nil
}
