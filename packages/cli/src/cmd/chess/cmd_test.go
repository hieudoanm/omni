package chess

import (
	"testing"
)

func TestNewCommand_HasSubcommands(t *testing.T) {
	cmd := NewCommand()
	if cmd.Use != "chess" {
		t.Errorf("expected Use='chess', got %q", cmd.Use)
	}

	expected := []string{"chess960", "com", "elo", "fen", "pgn", "play", "setup"}
	got := make(map[string]bool)
	for _, sub := range cmd.Commands() {
		got[sub.Name()] = true
	}

	for _, name := range expected {
		if !got[name] {
			t.Errorf("expected subcommand %q not found", name)
		}
	}
}
