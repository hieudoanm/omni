package openapi

import (
	"testing"
)

func TestNewCommand(t *testing.T) {
	cmd := NewCommand()
	if cmd == nil {
		t.Fatal("NewCommand() returned nil")
	}
	if cmd.Use != "openapi" {
		t.Errorf("Use = %q, want %q", cmd.Use, "openapi")
	}
	subs := cmd.Commands()
	if len(subs) != 2 {
		t.Fatalf("expected 2 subcommands, got %d", len(subs))
	}
	if subs[0].Name() != "openapi2postman" {
		t.Errorf("subcommand name = %q, want %q", subs[0].Name(), "openapi2postman")
	}
	if subs[1].Name() != "validate" {
		t.Errorf("subcommand name = %q, want %q", subs[1].Name(), "validate")
	}
}
