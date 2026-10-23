package gemini

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
)

type Model string

const (
	Model35Flash       Model = "gemini-3.5-flash"
	Model31FlashLite   Model = "gemini-3.1-flash-lite"
	Model31ProPreview  Model = "gemini-3.1-pro-preview"
	Model3FlashPreview Model = "gemini-3-flash-preview"
	Model25Pro         Model = "gemini-2.5-pro"
	Model25Flash       Model = "gemini-2.5-flash"
	Model25FlashLite   Model = "gemini-2.5-flash-lite"
	Model20Flash       Model = "gemini-2.0-flash"
	Model20FlashLite   Model = "gemini-2.0-flash-lite"
)

type Role string

const (
	RoleUser  Role = "user"
	RoleModel Role = "model"
)

type Part struct {
	Text string `json:"text"`
}

type Content struct {
	Role  Role   `json:"role"`
	Parts []Part `json:"parts"`
}

type GenerateContentResponse struct {
	Candidates    []Candidate   `json:"candidates"`
	UsageMetadata UsageMetadata `json:"usageMetadata"`
	ModelVersion  string        `json:"modelVersion"`
	ResponseID    string        `json:"responseId"`
}

type Candidate struct {
	Content      Content `json:"content"`
	FinishReason string  `json:"finishReason"`
	AvgLogprobs  float64 `json:"avgLogprobs"`
}

type UsageMetadata struct {
	PromptTokenCount        int           `json:"promptTokenCount"`
	CandidatesTokenCount    int           `json:"candidatesTokenCount"`
	TotalTokenCount         int           `json:"totalTokenCount"`
	PromptTokensDetails     []TokenDetail `json:"promptTokensDetails"`
	CandidatesTokensDetails []TokenDetail `json:"candidatesTokensDetails"`
}

type TokenDetail struct {
	Modality   string `json:"modality"`
	TokenCount int    `json:"tokenCount"`
}

type requestBody struct {
	Contents []Content `json:"contents"`
}

type GeminiClient struct {
	BaseURL string
	APIKey  string
}

func NewGeminiClient(apiKey string) *GeminiClient {
	return &GeminiClient{
		BaseURL: "https://generativelanguage.googleapis.com",
		APIKey:  apiKey,
	}
}

func (c *GeminiClient) GenerateContent(model Model, contents []Content) (*GenerateContentResponse, error) {
	url := fmt.Sprintf("%s/v1beta/models/%s:generateContent?key=%s", c.BaseURL, model, c.APIKey)

	reqBody := requestBody{Contents: contents}
	body, err := json.Marshal(reqBody)
	if err != nil {
		return nil, err
	}

	req, err := http.NewRequest("POST", url, bytes.NewBuffer(body))
	if err != nil {
		return nil, err
	}
	req.Header.Set("Content-Type", "application/json")

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("gemini.google.com API error: %s", resp.Status)
	}

	var result GenerateContentResponse
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return nil, err
	}
	return &result, nil
}
