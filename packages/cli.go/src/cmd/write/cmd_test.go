package write

import (
	"testing"
)

func TestNewCommand(t *testing.T) {
	cmd := NewCommand()
	if cmd.Use != "write" {
		t.Errorf("Use = %q, want %q", cmd.Use, "write")
	}
}

func TestNewCommandHasSubcommands(t *testing.T) {
	cmd := NewCommand()
	subs := cmd.Commands()
	names := make(map[string]bool)
	for _, c := range subs {
		names[c.Name()] = true
	}
	for _, want := range []string{"summarize", "grammar", "rewrite", "translate"} {
		if !names[want] {
			t.Errorf("missing subcommand: %s", want)
		}
	}
}
