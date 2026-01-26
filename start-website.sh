#!/bin/bash

# =============================================
#  Bhavy Yadav Portfolio - Startup Script
# =============================================

echo ""
echo "  ╔══════════════════════════════════════╗"
echo "  ║   Bhavy Yadav Portfolio Website      ║"
echo "  ╚══════════════════════════════════════╝"
echo ""

# Navigate to backend directory
cd "$(dirname "$0")/backend"

# Kill any existing server on port 8080
echo "[1/4] Stopping any existing server..."
fuser -k 8080/tcp 2>/dev/null
sleep 1

# Set environment variables
echo "[2/4] Loading email configuration..."
export PORT=8080
export SMTP_HOST=smtp.gmail.com
export SMTP_PORT=587
export SMTP_USER=yadavbhavy25@gmail.com
export SMTP_PASS=yewqxtjeygxpkaan
export TO_EMAIL=yadavbhavy25@gmail.com

# Build if needed
if [ ! -f "./server" ]; then
    echo "[3/4] Building server..."
    /snap/bin/go build -o server main.go
else
    echo "[3/4] Server binary found..."
fi

# Start server
echo "[4/4] Starting server..."
./server &
SERVER_PID=$!
sleep 2

# Check if server started successfully
if curl -s http://localhost:8080/api/health > /dev/null 2>&1; then
    echo ""
    echo "  ✓ Server running at: http://localhost:8080"
    echo "  ✓ Contact messages → yadavbhavy25@gmail.com"
    echo "  ✓ Backup log → $(pwd)/contacts.log"
    echo ""

    # Open in browser
    echo "Opening website in browser..."
    xdg-open "http://localhost:8080" 2>/dev/null &

    echo ""
    echo "Press Ctrl+C to stop the server"
    echo "─────────────────────────────────────────"
    echo ""

    # Wait for server process
    wait $SERVER_PID
else
    echo ""
    echo "  ✗ Failed to start server"
    echo "  Check if port 8080 is available"
    exit 1
fi
