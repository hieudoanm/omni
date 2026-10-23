package colors

import (
	"testing"
)

func TestNewCommand(t *testing.T) {
	cmd := NewCommand()
	if cmd.Use != "colors" {
		t.Errorf("got Use %q, want %q", cmd.Use, "colors")
	}
	if cmd.Short != "Color conversion and palette generation tools" {
		t.Errorf("got Short %q, want %q", cmd.Short, "Color conversion and palette generation tools")
	}
}

func TestNewCommand_hasAllSubcommands(t *testing.T) {
	cmd := NewCommand()
	want := []string{"figma", "hcl", "hex", "oklch", "rgb", "palette", "random"}
	got := cmd.Commands()
	if len(got) != len(want) {
		t.Fatalf("got %d subcommands, want %d", len(got), len(want))
	}
	names := make(map[string]bool)
	for _, c := range got {
		names[c.Name()] = true
	}
	for _, name := range want {
		if !names[name] {
			t.Errorf("missing subcommand: %s", name)
		}
	}
}
