package callback

import "testing"

func TestNewCmd(t *testing.T) {
	cmd := NewCmd()
	if cmd.Use != "callback" {
		t.Errorf("Use = %q, want 'callback'", cmd.Use)
	}
	if cmd.Short != "Answer callback queries" {
		t.Errorf("Short = %q", cmd.Short)
	}
	subs := cmd.Commands()
	if len(subs) != 1 {
		t.Fatalf("expected 1 subcommand, got %d", len(subs))
	}
}
