package serve

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"

	or "github.com/hieudoanm/omni/packages/cli/src/cmd/openrouter/openrouterlib"
)

type chatRequest struct {
	Prompt string `json:"prompt"`
	Model  string `json:"model"`
}

type chatResponse struct {
	Prompt   string `json:"prompt"`
	Response string `json:"response"`
}

type errorResponse struct {
	Error string `json:"error"`
}

func serveRoot(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{
		"message": "Go + OpenRouter Chat API server is running",
	})
}

func serveChat(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	if r.Method != http.MethodPost {
		w.WriteHeader(http.StatusMethodNotAllowed)
		json.NewEncoder(w).Encode(errorResponse{Error: "method not allowed"})
		return
	}

	var req chatRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(errorResponse{Error: "invalid request body"})
		return
	}

	if req.Model == "" {
		req.Model = "openai/gpt-oss-20b"
	}

	output, err := or.Generate(req.Model, req.Prompt)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(errorResponse{Error: err.Error()})
		return
	}

	json.NewEncoder(w).Encode(chatResponse{
		Prompt:   req.Prompt,
		Response: output,
	})
}

func runServe(servePort string) error {
	mux := http.NewServeMux()
	mux.HandleFunc("/", serveRoot)
	mux.HandleFunc("/chat", serveChat)

	addr := fmt.Sprintf(":%s", servePort)
	fmt.Printf("OpenRouter server listening on http://localhost%s\n", addr)
	fmt.Println("  GET  / -> health check")
	fmt.Println("  POST /chat -> {\"prompt\":\"...\",\"model\":\"...\"}")

	if err := http.ListenAndServe(addr, mux); err != nil {
		log.Fatalf("Server error: %v", err)
	}
	return nil
}
