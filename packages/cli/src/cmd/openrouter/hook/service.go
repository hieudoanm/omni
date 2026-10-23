package hook

import (
	"bufio"
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"os/exec"
	"strings"
	"time"
)

type TelegramUpdate struct {
	UpdateID int              `json:"update_id"`
	Message  *TelegramMessage `json:"message"`
}

type TelegramMessage struct {
	MessageID int          `json:"message_id"`
	Text      string       `json:"text"`
	Chat      TelegramChat `json:"chat"`
}

type TelegramChat struct {
	ID int64 `json:"id"`
}

type openRouterRequest struct {
	Model    string              `json:"model"`
	Messages []openRouterMessage `json:"messages"`
}

type openRouterMessage struct {
	Role    string `json:"role"`
	Content string `json:"content"`
}

type openRouterResponse struct {
	Choices []struct {
		Message struct {
			Content string `json:"content"`
		} `json:"message"`
	} `json:"choices"`
	Error *struct {
		Message string `json:"message"`
	} `json:"error"`
}

type ngrokLogLine struct {
	URL string `json:"url"`
	Msg string `json:"msg"`
}

type ngrokTunnelsResponse struct {
	Tunnels []struct {
		PublicURL string `json:"public_url"`
		Proto     string `json:"proto"`
	} `json:"tunnels"`
}

const telegramMaxLength = 4096

func runHook() error {
	fmt.Println("Starting hook mode...")
	fmt.Println()

	go startNgrok()

	return startWebhook()
}

func startWebhook() error {
	port := ":8080"

	http.HandleFunc("/webhook", func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodPost {
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
			return
		}

		fmt.Printf("[%s] Webhook received from %s\n", time.Now().Format(time.RFC3339), r.RemoteAddr)

		body, err := io.ReadAll(r.Body)
		defer r.Body.Close()
		if err != nil {
			fmt.Fprintf(os.Stderr, "Failed to read body: %v\n", err)
			w.WriteHeader(http.StatusOK)
			return
		}

		fmt.Printf("Raw body: %s\n", string(body))

		var update TelegramUpdate
		if err := json.Unmarshal(body, &update); err != nil {
			fmt.Fprintf(os.Stderr, "Failed to parse update: %v\n", err)
			w.WriteHeader(http.StatusOK)
			return
		}

		fmt.Printf("Parsed update_id=%d\n", update.UpdateID)

		if update.Message != nil {
			fmt.Printf("Message: chat_id=%d text=%q\n", update.Message.Chat.ID, update.Message.Text)
			if update.Message.Text != "" {
				if err := handleMessage(update.Message.Chat.ID, update.Message.Text); err != nil {
					fmt.Fprintf(os.Stderr, "Failed to handle message: %v\n", err)
				}
			}
		} else {
			fmt.Println("update.Message is nil - non-text update (sticker, photo, etc.)")
		}

		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		fmt.Fprintln(w, `{"ok":true}`)
	})

	http.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
		fmt.Fprintln(w, `{"status":"healthy"}`)
	})

	fmt.Printf("Webhook server listening on http://localhost%s/webhook\n", port)
	fmt.Printf("Health check available at http://localhost%s/health\n", port)
	fmt.Println()

	if err := http.ListenAndServe(port, nil); err != nil {
		fmt.Fprintf(os.Stderr, "Server error: %v\n", err)
		return fmt.Errorf("server error: %w", err)
	}
	return nil
}

func sendTelegramMessage(chatID int64, text string) error {
	token := os.Getenv("TELEGRAM_API_TOKEN")
	if token == "" {
		return fmt.Errorf("TELEGRAM_API_TOKEN is not set")
	}

	chunks := chunkText(text, telegramMaxLength)
	fmt.Printf("Sending %d chunk(s) to chat %d\n", len(chunks), chatID)

	for i, chunk := range chunks {
		if err := sendChunk(token, chatID, chunk); err != nil {
			return fmt.Errorf("failed to send chunk %d/%d: %w", i+1, len(chunks), err)
		}
		if i < len(chunks)-1 {
			time.Sleep(300 * time.Millisecond)
		}
	}

	fmt.Printf("Message sent to chat %d (%d chunk(s))\n", chatID, len(chunks))
	return nil
}

func sendChunk(token string, chatID int64, text string) error {
	apiURL := fmt.Sprintf("https://api.telegram.org/bot%s/sendMessage", token)

	payload := map[string]any{
		"chat_id":    chatID,
		"text":       text,
		"parse_mode": "Markdown",
	}
	body, err := json.Marshal(payload)
	if err != nil {
		return fmt.Errorf("failed to marshal payload: %w", err)
	}

	resp, err := http.Post(apiURL, "application/json", bytes.NewReader(body))
	if err != nil {
		return fmt.Errorf("failed to post message: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		respBody, _ := io.ReadAll(resp.Body)
		if resp.StatusCode == http.StatusBadRequest && strings.Contains(string(respBody), "can't parse entities") {
			fmt.Println("Markdown parse failed, retrying as plain text...")
			return sendChunkPlain(token, chatID, text)
		}
		return fmt.Errorf("telegram API error %d: %s", resp.StatusCode, string(respBody))
	}

	return nil
}

func sendChunkPlain(token string, chatID int64, text string) error {
	apiURL := fmt.Sprintf("https://api.telegram.org/bot%s/sendMessage", token)

	payload := map[string]any{
		"chat_id": chatID,
		"text":    text,
	}
	body, err := json.Marshal(payload)
	if err != nil {
		return fmt.Errorf("failed to marshal plain payload: %w", err)
	}

	resp, err := http.Post(apiURL, "application/json", bytes.NewReader(body))
	if err != nil {
		return fmt.Errorf("failed to post plain message: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		respBody, _ := io.ReadAll(resp.Body)
		return fmt.Errorf("telegram API error %d: %s", resp.StatusCode, string(respBody))
	}

	return nil
}

func chunkText(text string, maxLen int) []string {
	if len(text) <= maxLen {
		return []string{text}
	}

	var chunks []string
	lines := strings.Split(text, "\n")
	current := strings.Builder{}

	for _, line := range lines {
		if len(line) > maxLen {
			if current.Len() > 0 {
				chunks = append(chunks, strings.TrimSpace(current.String()))
				current.Reset()
			}
			for len(line) > maxLen {
				chunks = append(chunks, line[:maxLen])
				line = line[maxLen:]
			}
			current.WriteString(line + "\n")
			continue
		}

		if current.Len()+len(line)+1 > maxLen {
			chunks = append(chunks, strings.TrimSpace(current.String()))
			current.Reset()
		}
		current.WriteString(line + "\n")
	}

	if current.Len() > 0 {
		chunks = append(chunks, strings.TrimSpace(current.String()))
	}

	return chunks
}

func setTelegramWebhook(publicURL string) error {
	token := os.Getenv("TELEGRAM_API_TOKEN")
	if token == "" {
		return fmt.Errorf("TELEGRAM_API_TOKEN is not set")
	}

	webhookURL := publicURL + "/webhook"
	apiURL := fmt.Sprintf("https://api.telegram.org/bot%s/setWebhook", token)

	payload := map[string]string{"url": webhookURL}
	body, err := json.Marshal(payload)
	if err != nil {
		return fmt.Errorf("failed to marshal payload: %w", err)
	}

	resp, err := http.Post(apiURL, "application/json", bytes.NewReader(body))
	if err != nil {
		return fmt.Errorf("failed to call setWebhook: %w", err)
	}
	defer resp.Body.Close()

	respBody, _ := io.ReadAll(resp.Body)
	if resp.StatusCode != http.StatusOK {
		return fmt.Errorf("telegram API error %d: %s", resp.StatusCode, string(respBody))
	}

	fmt.Printf("Telegram webhook set to: %s\n", webhookURL)
	return nil
}

func setTelegramWebhookWithRetry(publicURL string) {
	const maxRetries = 10
	const retryDelay = 5 * time.Second

	publicURL = strings.TrimSpace(publicURL)
	fmt.Printf("Webhook URL: %q\n", publicURL)

	waitForTunnel(publicURL)

	for i := range maxRetries {
		fmt.Printf("Registering Telegram webhook (%d/%d)...\n", i+1, maxRetries)
		if err := setTelegramWebhook(publicURL); err == nil {
			return
		} else {
			fmt.Fprintf(os.Stderr, "Attempt %d failed: %v\n", i+1, err)
			time.Sleep(retryDelay)
		}
	}

	fmt.Fprintf(os.Stderr, "Failed to set Telegram webhook after %d attempts\n", maxRetries)
}

func waitForTunnel(publicURL string) {
	healthURL := publicURL + "/health"
	client := &http.Client{Timeout: 5 * time.Second}

	fmt.Println("Waiting for tunnel to become reachable...")

	for {
		resp, err := client.Get(healthURL)
		if err == nil {
			resp.Body.Close()
			if resp.StatusCode == http.StatusOK {
				fmt.Println("Tunnel is live!")
				return
			}
		}
		fmt.Printf("   not ready yet (%v), retrying in 5s...\n", err)
		time.Sleep(5 * time.Second)
	}
}

func startNgrok() {
	time.Sleep(1 * time.Second)

	fmt.Println("Starting ngrok tunnel...")

	ngrokCmd := exec.Command("ngrok", "http", "8080", "--log", "stdout", "--log-format", "json")
	ngrokCmd.Stderr = os.Stderr

	stdout, err := ngrokCmd.StdoutPipe()
	if err != nil {
		fmt.Fprintf(os.Stderr, "Failed to pipe ngrok output: %v\n", err)
		return
	}

	if err := ngrokCmd.Start(); err != nil {
		fmt.Fprintf(os.Stderr, "Failed to start ngrok: %v\n", err)
		fmt.Fprintln(os.Stderr, "Install it with: brew install ngrok")
		return
	}

	go scanNgrokLogs(stdout)

	fetchNgrokURL()

	if err := ngrokCmd.Wait(); err != nil {
		fmt.Fprintf(os.Stderr, "ngrok exited: %v\n", err)
	}
}

func scanNgrokLogs(r io.Reader) {
	scanner := bufio.NewScanner(r)
	for scanner.Scan() {
		line := scanner.Text()
		var entry ngrokLogLine
		if err := json.Unmarshal([]byte(line), &entry); err != nil {
			continue
		}
		if strings.Contains(entry.Msg, "started tunnel") && strings.HasPrefix(entry.URL, "https://") {
			fmt.Printf("\nngrok tunnel URL : %s\n\n", entry.URL)
		}
	}
}

func fetchNgrokURL() {
	client := &http.Client{Timeout: 3 * time.Second}
	apiURL := "http://localhost:4040/api/tunnels"

	fmt.Println("Waiting for ngrok API...")

	for range 20 {
		time.Sleep(2 * time.Second)

		resp, err := client.Get(apiURL)
		if err != nil {
			fmt.Printf("   ngrok API not ready yet: %v\n", err)
			continue
		}

		body, _ := io.ReadAll(resp.Body)
		resp.Body.Close()

		var tunnels ngrokTunnelsResponse
		if err := json.Unmarshal(body, &tunnels); err != nil {
			fmt.Printf("   failed to parse ngrok API response: %v\n", err)
			continue
		}

		for _, t := range tunnels.Tunnels {
			if t.Proto == "https" && strings.HasPrefix(t.PublicURL, "https://") {
				fmt.Printf("\nPublic HTTPS URL : %s\n\n", t.PublicURL)
				go setTelegramWebhookWithRetry(t.PublicURL)
				return
			}
		}
	}

	fmt.Fprintln(os.Stderr, "Could not retrieve ngrok tunnel URL after 40s")
}

func handleMessage(chatID int64, text string) error {
	fmt.Printf("Processing message with LLM: %q\n", text)

	reply, err := queryOpenRouter(text)
	if err != nil {
		return fmt.Errorf("failed to query OpenRouter: %w", err)
	}

	fmt.Printf("LLM reply: %q\n", reply)
	return sendTelegramMessage(chatID, reply)
}

func queryOpenRouter(text string) (string, error) {
	apiKey := os.Getenv("OPEN_ROUTER_API_KEY")
	if apiKey == "" {
		return "", fmt.Errorf("OPEN_ROUTER_API_KEY is not set")
	}

	payload := openRouterRequest{
		Model: "openrouter/free",
		Messages: []openRouterMessage{
			{Role: "user", Content: text},
		},
	}
	body, err := json.Marshal(payload)
	if err != nil {
		return "", fmt.Errorf("failed to marshal request: %w", err)
	}

	req, err := http.NewRequest(http.MethodPost, "https://openrouter.ai/api/v1/chat/completions", bytes.NewReader(body))
	if err != nil {
		return "", fmt.Errorf("failed to create request: %w", err)
	}
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer "+apiKey)

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return "", fmt.Errorf("failed to call OpenRouter: %w", err)
	}
	defer resp.Body.Close()

	respBody, _ := io.ReadAll(resp.Body)
	if resp.StatusCode != http.StatusOK {
		return "", fmt.Errorf("OpenRouter API error %d: %s", resp.StatusCode, string(respBody))
	}

	var result openRouterResponse
	if err := json.Unmarshal(respBody, &result); err != nil {
		return "", fmt.Errorf("failed to parse OpenRouter response: %w", err)
	}

	if result.Error != nil {
		return "", fmt.Errorf("OpenRouter error: %s", result.Error.Message)
	}

	if len(result.Choices) == 0 {
		return "", fmt.Errorf("no choices returned from OpenRouter")
	}

	return strings.TrimSpace(result.Choices[0].Message.Content), nil
}
