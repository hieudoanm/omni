package gemini

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"
)

func TestGenerateContent(t *testing.T) {
	t.Run("success", func(t *testing.T) {
		ts := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			if r.Method != "POST" {
				t.Errorf("expected POST, got %s", r.Method)
			}
			if r.Header.Get("Content-Type") != "application/json" {
				t.Errorf("expected application/json, got %s", r.Header.Get("Content-Type"))
			}

			var req requestBody
			if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
				t.Fatal(err)
			}
			if len(req.Contents) != 1 || req.Contents[0].Role != RoleUser {
				t.Errorf("unexpected request body: %+v", req)
			}

			w.Header().Set("Content-Type", "application/json")
			json.NewEncoder(w).Encode(GenerateContentResponse{
				Candidates: []Candidate{
					{
						Content:      Content{Role: RoleModel, Parts: []Part{{Text: "Hello!"}}},
						FinishReason: "STOP",
						AvgLogprobs:  -0.5,
					},
				},
				UsageMetadata: UsageMetadata{
					PromptTokenCount:     10,
					CandidatesTokenCount: 5,
					TotalTokenCount:      15,
				},
				ModelVersion: "gemini-2.0-flash",
				ResponseID:   "test-id",
			})
		}))
		defer ts.Close()

		c := &GeminiClient{BaseURL: ts.URL, APIKey: "test-key"}
		contents := []Content{{Role: RoleUser, Parts: []Part{{Text: "Hi"}}}}
		result, err := c.GenerateContent(Model20Flash, contents)
		if err != nil {
			t.Fatal(err)
		}
		if len(result.Candidates) != 1 || result.Candidates[0].Content.Parts[0].Text != "Hello!" {
			t.Errorf("unexpected candidates: %+v", result.Candidates)
		}
		if result.ModelVersion != "gemini-2.0-flash" {
			t.Errorf("expected gemini-2.0-flash, got %s", result.ModelVersion)
		}
	})

	t.Run("model in url", func(t *testing.T) {
		ts := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			if r.URL.Path != "/v1beta/models/gemini-2.5-flash:generateContent" {
				t.Errorf("unexpected path: %s", r.URL.Path)
			}
			w.Header().Set("Content-Type", "application/json")
			json.NewEncoder(w).Encode(GenerateContentResponse{
				ModelVersion: "gemini-2.5-flash",
			})
		}))
		defer ts.Close()

		c := &GeminiClient{BaseURL: ts.URL, APIKey: "key"}
		result, err := c.GenerateContent(Model25Flash, nil)
		if err != nil {
			t.Fatal(err)
		}
		if result.ModelVersion != "gemini-2.5-flash" {
			t.Errorf("expected gemini-2.5-flash, got %s", result.ModelVersion)
		}
	})

	t.Run("error status", func(t *testing.T) {
		ts := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			w.WriteHeader(http.StatusBadRequest)
		}))
		defer ts.Close()

		c := &GeminiClient{BaseURL: ts.URL, APIKey: "bad-key"}
		_, err := c.GenerateContent(Model20Flash, nil)
		if err == nil {
			t.Fatal("expected error")
		}
	})

	t.Run("NewGeminiClient default", func(t *testing.T) {
		c := NewGeminiClient("test-key")
		if c.BaseURL != "https://generativelanguage.googleapis.com" {
			t.Errorf("expected https://generativelanguage.googleapis.com, got %s", c.BaseURL)
		}
		if c.APIKey != "test-key" {
			t.Errorf("expected test-key, got %s", c.APIKey)
		}
	})
}
