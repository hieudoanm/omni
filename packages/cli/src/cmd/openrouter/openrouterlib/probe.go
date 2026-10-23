package openrouterlib

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"time"
)

type ProbeStatus int

const (
	StatusOK ProbeStatus = iota
	StatusRateLimited
	StatusRestricted
	StatusError
)

type ProbeResult struct {
	Model   Model
	Status  ProbeStatus
	Message string
	Latency int64
}

func ProbeModel(m Model, apiKey string) ProbeResult {
	payload := map[string]any{
		"model": m.ID,
		"messages": []map[string]any{
			{"role": "user", "content": "hi"},
		},
		"max_tokens": 1,
		"provider": map[string]any{
			"allow_fallbacks": false,
			"data_collection": "allow",
		},
	}

	body, _ := json.Marshal(payload)

	req, err := http.NewRequest(http.MethodPost, BaseURL+"/chat/completions", bytes.NewReader(body))
	if err != nil {
		return ProbeResult{Model: m, Status: StatusError, Message: err.Error()}
	}
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer "+apiKey)
	req.Header.Set("HTTP-Referer", "https://github.com/freerouter/freerouter")
	req.Header.Set("X-Title", "freerouter")

	start := time.Now()
	resp, err := http.DefaultClient.Do(req)
	elapsed := time.Since(start).Milliseconds()
	if err != nil {
		return ProbeResult{Model: m, Status: StatusError, Message: err.Error()}
	}
	defer resp.Body.Close()

	raw, _ := io.ReadAll(resp.Body)

	switch resp.StatusCode {
	case http.StatusOK:
		return ProbeResult{Model: m, Status: StatusOK, Latency: elapsed}
	case http.StatusTooManyRequests:
		return ProbeResult{Model: m, Status: StatusRateLimited, Message: ExtractMessage(raw)}
	case http.StatusNotFound:
		return ProbeResult{Model: m, Status: StatusRestricted, Message: ExtractMessage(raw)}
	default:
		msg := ExtractMessage(raw)
		if msg == "" {
			msg = fmt.Sprintf("HTTP %d", resp.StatusCode)
		}
		return ProbeResult{Model: m, Status: StatusError, Message: msg}
	}
}

func ExtractMessage(raw []byte) string {
	var envelope struct {
		Error struct {
			Message string `json:"message"`
		} `json:"error"`
	}
	if err := json.Unmarshal(raw, &envelope); err == nil && envelope.Error.Message != "" {
		msg := envelope.Error.Message
		if len(msg) > 80 {
			msg = msg[:77] + "..."
		}
		return msg
	}
	return ""
}
