package file

import (
	"testing"
)

func TestNewCommand(t *testing.T) {
	cmd := NewCommand()
	if cmd == nil {
		t.Fatal("NewCommand() returned nil")
	}
	if cmd.Use != "file" {
		t.Errorf("Use = %q, want %q", cmd.Use, "file")
	}
	if cmd.Commands() == nil {
		t.Fatal("expected subcommands")
	}
}

func TestNewCommandHasSubcommands(t *testing.T) {
	cmd := NewCommand()
	names := make(map[string]bool)
	for _, c := range cmd.Commands() {
		names[c.Name()] = true
	}
	for _, want := range []string{"checksum", "chmod", "count", "duplicates", "edit", "grep", "head", "read", "size", "stats", "tail", "type", "write"} {
		if !names[want] {
			t.Errorf("missing subcommand: %s", want)
		}
	}
}
