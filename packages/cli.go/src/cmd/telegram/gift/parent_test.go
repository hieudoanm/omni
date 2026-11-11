package gift

import "testing"

func TestNewCmd(t *testing.T) {
	cmd := NewCmd()
	if cmd.Use != "gift" {
		t.Errorf("Use = %q, want 'gift'", cmd.Use)
	}
	if cmd.Short != "Send gifts" {
		t.Errorf("Short = %q", cmd.Short)
	}
	subs := cmd.Commands()
	if len(subs) != 1 {
		t.Fatalf("expected 1 subcommand, got %d", len(subs))
	}
}
