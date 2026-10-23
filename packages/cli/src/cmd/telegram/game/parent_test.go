package game

import "testing"

func TestNewCmd(t *testing.T) {
	cmd := NewCmd()
	if cmd.Use != "game" {
		t.Errorf("Use = %q, want 'game'", cmd.Use)
	}
	if cmd.Short != "Send and manage games" {
		t.Errorf("Short = %q", cmd.Short)
	}
	subs := cmd.Commands()
	if len(subs) != 3 {
		t.Fatalf("expected 3 subcommands, got %d", len(subs))
	}
}
