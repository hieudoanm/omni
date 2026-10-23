package bot

import "testing"

func TestNewCmd(t *testing.T) {
	cmd := NewCmd()
	if cmd.Use != "bot" {
		t.Errorf("Use = %q, want 'bot'", cmd.Use)
	}
	if cmd.Short != "Bot management" {
		t.Errorf("Short = %q", cmd.Short)
	}
	subs := cmd.Commands()
	if len(subs) != 5 {
		t.Fatalf("expected 5 subcommands, got %d", len(subs))
	}
}
