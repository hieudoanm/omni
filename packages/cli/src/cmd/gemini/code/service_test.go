package code

import (
	"testing"
)

func TestModelName_knownIDs(t *testing.T) {
	tests := []struct {
		id   string
		want string
	}{
		{"gemini-3.5-flash", "Gemini 3.5 Flash"},
		{"gemini-2.5-flash", "Gemini 2.5 Flash"},
		{"gemini-2.5-flash-lite", "Gemini 2.5 Flash-Lite"},
		{"gemini-2.0-flash", "Gemini 2.0 Flash"},
	}

	for _, tt := range tests {
		got := modelName(tt.id)
		if got != tt.want {
			t.Errorf("modelName(%q) = %q, want %q", tt.id, got, tt.want)
		}
	}
}

func TestModelName_unknownID(t *testing.T) {
	id := "models/unknown-model"
	got := modelName(id)
	if got != id {
		t.Errorf("modelName(%q) = %q, want %q (fallback to ID)", id, got, id)
	}
}

func TestModelName_emptyString(t *testing.T) {
	got := modelName("")
	if got != "" {
		t.Errorf("modelName(\"\") = %q, want \"\"", got)
	}
}
