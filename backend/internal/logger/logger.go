package logger

import (
	"os"
	"path/filepath"

	"github.com/gookit/slog"
	"github.com/gookit/slog/handler"
	"github.com/gookit/slog/rotatefile"
)

// Init configures the default slog logger with colored console output,
// rotating file handler, caller info, and structured data support.
func Init() {
	// Configure the std logger's built-in formatter (console output).
	slog.Configure(func(l *slog.SugaredLogger) {
		l.ReportCaller = true
		l.CallerSkip = 6
		l.Level = slog.TraceLevel

		f := l.Formatter.(*slog.TextFormatter)
		f.SetTemplate("{{datetime}} [{{level}}] [{{caller}}] {{message}} {{data}} {{extra}}\n")
		f.EnableColor = true
	})

	// Add rotating file handler: logs/app.log, daily rotation, 10MB max, 7 backups.
	logDir := "logs"
	if err := os.MkdirAll(logDir, 0755); err == nil {
		fileH, err := handler.NewRotateFileHandler(
			filepath.Join(logDir, "app.log"),
			rotatefile.EveryDay,
			handler.WithMaxSize(10*1024*1024),
			handler.WithBackupNum(7),
		)
		if err == nil {
			slog.PushHandler(fileH)
		}
	}
}
