package code

import (
	"testing"
)

func TestNewCmd(t *testing.T) {
	cmd := NewCmd()
	if cmd.Use != "code" {
		t.Errorf("expected Use 'code', got %q", cmd.Use)
	}
	if cmd.Short != "Gemini-powered AI coding assistant" {
		t.Errorf("expected Short %q, got %q", "Gemini-powered AI coding assistant", cmd.Short)
	}
}
