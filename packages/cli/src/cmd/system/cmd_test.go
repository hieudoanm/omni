package system

import (
	"testing"

	"github.com/spf13/cobra"
)

func TestNewCommand(t *testing.T) {
	cmd := NewCommand()

	if cmd.Use != "system" {
		t.Errorf("expected Use='system', got %q", cmd.Use)
	}

	expected := []string{"monitor", "clipboard", "info", "env", "path", "disk", "battery"}
	got := make(map[string]*cobra.Command)
	for _, c := range cmd.Commands() {
		got[c.Name()] = c
	}

	for _, name := range expected {
		if _, ok := got[name]; !ok {
			t.Errorf("expected subcommand %q not found", name)
		}
	}

	if f := cmd.PersistentFlags().Lookup("json"); f == nil {
		t.Error("expected persistent --json flag")
	} else if f.DefValue != "false" {
		t.Errorf("--json default = %q, want 'false'", f.DefValue)
	}
}
