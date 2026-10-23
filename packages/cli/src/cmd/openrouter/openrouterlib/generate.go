package openrouterlib

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"

	"github.com/hieudoanm/omni/packages/cli/src/cmd/openrouter/config"
)

type generateRequest struct {
	Model     string        `json:"model"`
	Messages  []generateMsg `json:"messages"`
	MaxTokens int           `json:"max_tokens,omitempty"`
}

type generateMsg struct {
	Role    string `json:"role"`
	Content string `json:"content"`
}

type generateResponse struct {
	Choices []struct {
		Message generateMsg `json:"message"`
	} `json:"choices"`
	Error *struct {
		Message string `json:"message"`
	} `json:"error,omitempty"`
}

func Generate(model, prompt string) (string, error) {
	apiKey := config.LoadAPIKey()
	if apiKey == "" {
		return "", fmt.Errorf("OpenRouter API key not found")
	}

	reqBody := generateRequest{
		Model: model,
		Messages: []generateMsg{
			{Role: "user", Content: prompt},
		},
		MaxTokens: 2048,
	}

	body, err := json.Marshal(reqBody)
	if err != nil {
		return "", fmt.Errorf("marshal request: %w", err)
	}

	req, err := http.NewRequest(http.MethodPost, BaseURL+"/chat/completions", bytes.NewReader(body))
	if err != nil {
		return "", fmt.Errorf("create request: %w", err)
	}

	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer "+apiKey)
	req.Header.Set("HTTP-Referer", "https://github.com/hieudoanm/omni/packages/cli")
	req.Header.Set("X-Title", "omni")

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return "", fmt.Errorf("request failed: %w", err)
	}
	defer resp.Body.Close()

	raw, err := io.ReadAll(resp.Body)
	if err != nil {
		return "", fmt.Errorf("read response: %w", err)
	}

	if resp.StatusCode != http.StatusOK {
		var errResp generateResponse
		if json.Unmarshal(raw, &errResp) == nil && errResp.Error != nil {
			return "", fmt.Errorf("OpenRouter error: %s", errResp.Error.Message)
		}
		return "", fmt.Errorf("OpenRouter returned HTTP %d", resp.StatusCode)
	}

	var result generateResponse
	if err := json.Unmarshal(raw, &result); err != nil {
		return "", fmt.Errorf("decode response: %w", err)
	}

	if len(result.Choices) == 0 {
		return "", fmt.Errorf("no choices returned")
	}

	return result.Choices[0].Message.Content, nil
}
