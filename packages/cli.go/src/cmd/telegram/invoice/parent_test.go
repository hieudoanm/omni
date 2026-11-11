package invoice

import "testing"

func TestNewCmd(t *testing.T) {
	cmd := NewCmd()
	if cmd.Use != "invoice" {
		t.Errorf("Use = %q, want 'invoice'", cmd.Use)
	}
	if cmd.Short != "Create and manage invoices" {
		t.Errorf("Short = %q", cmd.Short)
	}
	subs := cmd.Commands()
	if len(subs) != 3 {
		t.Fatalf("expected 3 subcommands, got %d", len(subs))
	}
}
