package handler

import (
	"encoding/json"
	"log"
	"net/http"
	"sync"

	"github.com/gorilla/websocket"
)

// VisitorHandler manages real-time visitor tracking over WebSocket.
type VisitorHandler struct {
	hub      *visitorHub
	upgrader websocket.Upgrader
}

func NewVisitorHandler() *VisitorHandler {
	return &VisitorHandler{
		hub: newVisitorHub(),
		upgrader: websocket.Upgrader{
			ReadBufferSize:  1024,
			WriteBufferSize: 1024,
			CheckOrigin:     func(r *http.Request) bool { return true },
		},
	}
}

// RunHub starts the hub event loop. Call this in a goroutine before accepting connections.
func (h *VisitorHandler) RunHub() { h.hub.run() }

// Handle upgrades an HTTP request to a WebSocket connection and tracks the visitor.
func (h *VisitorHandler) Handle(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Access-Control-Allow-Origin", "*")

	conn, err := h.upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Printf("[visitor] upgrade error: %v", err)
		return
	}

	h.hub.register <- conn

	// Send current count immediately.
	count := h.hub.getCount()
	msg, _ := json.Marshal(map[string]int{"count": count})
	conn.WriteMessage(websocket.TextMessage, msg)

	// Read loop detects disconnection.
	go func() {
		defer func() { h.hub.unregister <- conn }()
		for {
			if _, _, err := conn.ReadMessage(); err != nil {
				if websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway, websocket.CloseAbnormalClosure) {
					log.Printf("[visitor] read error: %v", err)
				}
				return
			}
		}
	}()
}

// ---------- hub ----------

type visitorHub struct {
	clients    map[*websocket.Conn]bool
	register   chan *websocket.Conn
	unregister chan *websocket.Conn
	mu         sync.RWMutex
}

func newVisitorHub() *visitorHub {
	return &visitorHub{
		clients:    make(map[*websocket.Conn]bool),
		register:   make(chan *websocket.Conn),
		unregister: make(chan *websocket.Conn),
	}
}

func (h *visitorHub) run() {
	for {
		select {
		case conn := <-h.register:
			h.mu.Lock()
			h.clients[conn] = true
			count := len(h.clients)
			h.mu.Unlock()
			log.Printf("[visitor] connected — total: %d", count)
			h.broadcast(count)

		case conn := <-h.unregister:
			h.mu.Lock()
			if _, ok := h.clients[conn]; ok {
				delete(h.clients, conn)
				conn.Close()
			}
			count := len(h.clients)
			h.mu.Unlock()
			log.Printf("[visitor] disconnected — total: %d", count)
			h.broadcast(count)
		}
	}
}

func (h *visitorHub) broadcast(count int) {
	h.mu.RLock()
	defer h.mu.RUnlock()

	msg, _ := json.Marshal(map[string]int{"count": count})
	for conn := range h.clients {
		if err := conn.WriteMessage(websocket.TextMessage, msg); err != nil {
			log.Printf("[visitor] broadcast error: %v", err)
			conn.Close()
			delete(h.clients, conn)
		}
	}
}

func (h *visitorHub) getCount() int {
	h.mu.RLock()
	defer h.mu.RUnlock()
	return len(h.clients)
}
