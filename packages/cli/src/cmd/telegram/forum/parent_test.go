package forum

import "testing"

func TestNewCmd(t *testing.T) {
	cmd := NewCmd()
	if cmd.Use != "forum" {
		t.Errorf("Use = %q, want 'forum'", cmd.Use)
	}
	if cmd.Short != "Manage forum topics" {
		t.Errorf("Short = %q", cmd.Short)
	}
	subs := cmd.Commands()
	if len(subs) != 4 {
		t.Fatalf("expected 4 subcommands, got %d", len(subs))
	}
}
