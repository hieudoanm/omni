package internal

import (
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	"strings"

	"github.com/hieudoanm/omni/packages/cli/src/libs/requests"
)

type chatMessage struct {
	Role    string `json:"role"`
	Content string `json:"content"`
}

type chatRequest struct {
	Model    string        `json:"model"`
	Messages []chatMessage `json:"messages"`
}

type chatResponse struct {
	Choices []struct {
		Message struct {
			Content string `json:"content"`
		} `json:"message"`
	} `json:"choices"`
	Error *struct {
		Message string `json:"message"`
	} `json:"error,omitempty"`
}

func CallLLM(systemPrompt, userText string) (string, error) {
	apiKey := os.Getenv("OPENROUTER_API_KEY")
	if apiKey == "" {
		return "", fmt.Errorf("OPENROUTER_API_KEY environment variable not set")
	}

	body := chatRequest{
		Model: "openai/gpt-4o-mini",
		Messages: []chatMessage{
			{Role: "system", Content: systemPrompt},
			{Role: "user", Content: userText},
		},
	}

	resp, err := requests.Post("https://openrouter.ai/api/v1/chat/completions", requests.Options{
		Header: http.Header{
			"Authorization": {"Bearer " + apiKey},
		},
		Body: body,
	})
	if err != nil {
		return "", fmt.Errorf("API call failed: %w", err)
	}

	var result chatResponse
	if err := json.Unmarshal(resp, &result); err != nil {
		return "", fmt.Errorf("failed to parse response: %w", err)
	}

	if result.Error != nil && result.Error.Message != "" {
		return "", fmt.Errorf("API error: %s", result.Error.Message)
	}

	if len(result.Choices) == 0 {
		return "", fmt.Errorf("no response from API")
	}

	return strings.TrimSpace(result.Choices[0].Message.Content), nil
}
