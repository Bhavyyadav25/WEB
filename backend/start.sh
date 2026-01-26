#!/bin/bash

# Portfolio Backend Startup Script
# This script loads environment variables and starts the server

echo "================================"
echo "  Bhavy Yadav Portfolio Backend"
echo "================================"

# Load .env file if it exists
if [ -f .env ]; then
    echo "Loading configuration from .env..."
    export $(grep -v '^#' .env | xargs)
else
    echo "WARNING: No .env file found!"
    echo "Copy .env.example to .env and configure it."
    echo ""
    echo "Running with defaults (messages will be saved to contacts.log only)"
fi

echo ""
echo "Configuration:"
echo "  Port: ${PORT:-8080}"
echo "  Email: ${SMTP_USER:-not configured}"
echo "  To: ${TO_EMAIL:-yadavbhavy25@gmail.com}"
echo "  Groq AI: $([ -n "$GROQ_API_KEY" ] && echo 'enabled' || echo 'disabled')"
echo ""

# Start the server
echo "Starting server..."
go run main.go
