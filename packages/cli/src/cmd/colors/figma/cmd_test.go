package figma

import "testing"

func TestNewCommand(t *testing.T) {
	cmd := NewCommand()
	if cmd.Use != "figma" {
		t.Errorf("Use = %q, want %q", cmd.Use, "figma")
	}
	if cmd.Short != "Figma color palettes: list, look up, and explore color palettes" {
		t.Errorf("Short = %q, want %q", cmd.Short, "Figma color palettes: list, look up, and explore color palettes")
	}
}

func TestNewCommand_hasAllSubcommands(t *testing.T) {
	cmd := NewCommand()
	want := []string{"list", "name", "hex", "palettes"}
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

func TestNewCommand_hasJSONFlag(t *testing.T) {
	cmd := NewCommand()
	f := cmd.PersistentFlags().Lookup("json")
	if f == nil {
		t.Fatal("missing --json flag on figma root")
	}
	if f.Shorthand != "j" {
		t.Errorf("shorthand = %q, want %q", f.Shorthand, "j")
	}
}
