package search

import (
	"testing"
)

func TestNewCommand(t *testing.T) {
	cmd := NewCommand()
	if cmd == nil {
		t.Fatal("NewCommand() returned nil")
	}
	if cmd.Use != "search" {
		t.Errorf("Use = %q, want %q", cmd.Use, "search")
	}

	names := make(map[string]bool)
	for _, c := range cmd.Commands() {
		names[c.Name()] = true
	}
	for _, want := range []string{"files", "text", "code", "web"} {
		if !names[want] {
			t.Errorf("missing subcommand: %s", want)
		}
	}
}
