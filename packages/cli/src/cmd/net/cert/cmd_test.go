package cert

import (
	"testing"
)

func TestNewCmd_Structure(t *testing.T) {
	cmd := NewCmd()
	if cmd.Use != "cert" {
		t.Errorf("Use = %q", cmd.Use)
	}
	if cmd.Short != "SSL/TLS certificate inspection" {
		t.Errorf("Short = %q", cmd.Short)
	}
	subs := cmd.Commands()
	if len(subs) != 2 {
		t.Fatalf("expected 2 subcommands, got %d", len(subs))
	}
}
