package inline

import "testing"

func TestNewCmd(t *testing.T) {
	cmd := NewCmd()
	if cmd.Use != "inline" {
		t.Errorf("Use = %q, want 'inline'", cmd.Use)
	}
	if cmd.Short != "Answer inline queries" {
		t.Errorf("Short = %q", cmd.Short)
	}
	subs := cmd.Commands()
	if len(subs) != 1 {
		t.Fatalf("expected 1 subcommand, got %d", len(subs))
	}
}
