package port

import (
	"testing"
)

func TestNewCommand(t *testing.T) {
	cmd := NewCommand()
	if cmd == nil {
		t.Fatal("NewCommand() returned nil")
	}
	if cmd.Use != "port" {
		t.Errorf("Use = %q", cmd.Use)
	}
	names := make(map[string]bool)
	for _, c := range cmd.Commands() {
		names[c.Name()] = true
	}
	for _, want := range []string{"check", "find", "scan"} {
		if !names[want] {
			t.Errorf("missing subcommand: %s", want)
		}
	}
	if cmd.PersistentFlags().Lookup("json") == nil {
		t.Error("expected --json persistent flag")
	}
}
