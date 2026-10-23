package pdf

import (
	"testing"
)

func TestNewCommand(t *testing.T) {
	cmd := NewCommand()
	if cmd.Use != "pdf" {
		t.Errorf("Use = %q, want %q", cmd.Use, "pdf")
	}
}

func TestNewCommand_HasSubcommands(t *testing.T) {
	cmd := NewCommand()
	subs := cmd.Commands()
	names := make(map[string]bool)
	for _, c := range subs {
		names[c.Name()] = true
	}
	for _, want := range []string{"combine", "security", "extract", "edit", "inspect", "maintain", "convert", "crop", "delete", "rearrange", "add-numbers", "create", "annotate"} {
		if !names[want] {
			t.Errorf("missing subcommand: %s", want)
		}
	}
}
