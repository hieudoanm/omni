package openrouter

import (
	"testing"
)

func TestNewCommand(t *testing.T) {
	cmd := NewCommand()
	if cmd.Use != "openrouter" {
		t.Errorf("Use = %q, want %q", cmd.Use, "openrouter")
	}
}

func TestNewCommand_HasSubcommands(t *testing.T) {
	cmd := NewCommand()
	subs := cmd.Commands()
	names := make(map[string]bool)
	for _, c := range subs {
		names[c.Name()] = true
	}
	for _, want := range []string{"serve", "status", "models", "hook", "code"} {
		if !names[want] {
			t.Errorf("missing subcommand: %s", want)
		}
	}
}
