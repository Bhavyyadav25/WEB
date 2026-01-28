package handler

import (
	"encoding/json"
	"net/http"

	"portfolio-backend/internal/httputil"
	"portfolio-backend/internal/model"
	"portfolio-backend/internal/service"
)

// ChatHandler serves AI-powered chat responses.
type ChatHandler struct {
	chat service.ChatService
}

func NewChatHandler(chat service.ChatService) *ChatHandler {
	return &ChatHandler{chat: chat}
}

func (h *ChatHandler) Handle(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		httputil.SendJSON(w, http.StatusMethodNotAllowed, model.APIResponse{
			Success: false, Message: "Method not allowed",
		})
		return
	}

	var req model.ChatRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		httputil.SendJSON(w, http.StatusBadRequest, model.APIResponse{
			Success: false, Message: "Invalid request body",
		})
		return
	}

	if req.Message == "" {
		httputil.SendJSON(w, http.StatusBadRequest, model.APIResponse{
			Success: false, Message: "Message is required",
		})
		return
	}

	response, _ := h.chat.GetResponse(req.Message, req.History)

	httputil.SendJSON(w, http.StatusOK, model.APIResponse{
		Success: true,
		Message: "Response generated",
		Data:    map[string]string{"response": response},
	})
}
