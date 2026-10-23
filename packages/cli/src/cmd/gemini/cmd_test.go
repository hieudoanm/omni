package gemini

import (
	"testing"
)

func TestNewCommand(t *testing.T) {
	cmd := NewCommand()
	if cmd.Use != "gemini" {
		t.Errorf("expected Use 'gemini', got %q", cmd.Use)
	}

	sub, _, err := cmd.Find([]string{"code"})
	if err != nil {
		t.Errorf("expected subcommand 'code', got error: %v", err)
	}
	if sub.Use != "code" {
		t.Errorf("expected subcommand Use 'code', got %q", sub.Use)
	}
}
