package openrouterlib

import (
	"testing"
)

func TestIsFree(t *testing.T) {
	tests := []struct {
		pricing  Pricing
		expected bool
	}{
		{Pricing{Prompt: "0", Completion: "0"}, true},
		{Pricing{Prompt: "", Completion: ""}, true},
		{Pricing{Prompt: "0.01", Completion: "0"}, false},
		{Pricing{Prompt: "0", Completion: "0.01"}, false},
	}

	for _, tt := range tests {
		if res := isFree(tt.pricing); res != tt.expected {
			t.Errorf("isFree(%v) = %v; expected %v", tt.pricing, res, tt.expected)
		}
	}
}

func TestResolveModel(t *testing.T) {
	models := []Model{
		{ID: "openai/gpt-3.5-turbo", Name: "GPT-3.5 Turbo"},
		{ID: "openai/gpt-3.5-turbo:free", Name: "GPT-3.5 Turbo Free"},
		{ID: "google/palm-2-chat-bison", Name: "PaLM 2 Chat"},
	}

	tests := []struct {
		query    string
		expected string
	}{
		{"openai/gpt-3.5-turbo", "openai/gpt-3.5-turbo"},
		{"gpt-3.5-turbo", "openai/gpt-3.5-turbo:free"},
		{"palm", "google/palm-2-chat-bison"},
		{"unknown", ""},
	}

	for _, tt := range tests {
		res := ResolveModel(tt.query, models)
		if tt.expected == "" {
			if res != nil {
				t.Errorf("ResolveModel(%s) expected nil, got %s", tt.query, res.ID)
			}
		} else {
			if res == nil || res.ID != tt.expected {
				got := "nil"
				if res != nil {
					got = res.ID
				}
				t.Errorf("ResolveModel(%s) = %s; expected %s", tt.query, got, tt.expected)
			}
		}
	}
}
