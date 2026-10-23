package doi

import (
	"testing"
)

func TestNewCommand(t *testing.T) {
	cmd := NewCommand()
	if cmd.Use != "doi" {
		t.Errorf("Use = %q, want %q", cmd.Use, "doi")
	}
	if cmd.Short != "DOI productivity tools" {
		t.Errorf("Short = %q", cmd.Short)
	}
	if cmd.Long == "" {
		t.Error("Long should not be empty")
	}
	if cmd.Example == "" {
		t.Error("Example should not be empty")
	}
	if cmd.Flag("json") == nil {
		t.Error("expected --json persistent flag")
	}

	subs := cmd.Commands()
	if len(subs) != 4 {
		t.Fatalf("expected 4 subcommands, got %d", len(subs))
	}

	names := make(map[string]bool)
	for _, s := range subs {
		names[s.Name()] = true
	}
	for _, name := range []string{"cite", "fetch", "ref", "validate"} {
		if !names[name] {
			t.Errorf("missing subcommand: %s", name)
		}
	}
}
