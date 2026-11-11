package excel

import (
	"testing"
)

func TestNewCmd(t *testing.T) {
	cmd := NewCmd()
	if cmd.Use != "excel" {
		t.Errorf("Use = %q, want %q", cmd.Use, "excel")
	}
}

func TestNewCmdHasSubcommands(t *testing.T) {
	cmd := NewCmd()
	subs := cmd.Commands()
	names := make(map[string]bool)
	for _, c := range subs {
		names[c.Name()] = true
	}
	for _, want := range []string{"to-csv", "to-json", "info"} {
		if !names[want] {
			t.Errorf("missing subcommand: %s", want)
		}
	}
}
