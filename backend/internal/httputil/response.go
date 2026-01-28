package httputil

import (
	"encoding/json"
	"net/http"
)

// SendJSON writes a JSON response with the given status code.
func SendJSON(w http.ResponseWriter, status int, data any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	json.NewEncoder(w).Encode(data)
}
