package web

import (
	"testing"

	"github.com/spf13/cobra"
)

func TestNewCommand_HasSubcommands(t *testing.T) {
	cmd := NewCommand()
	if cmd.Use != "web" {
		t.Errorf("expected Use='web', got %q", cmd.Use)
	}

	expected := []string{"shopify", "simplify", "snapshot", "weather", "youtube"}
	got := make(map[string]*cobra.Command)
	for _, sub := range cmd.Commands() {
		got[sub.Name()] = sub
	}

	for _, name := range expected {
		if _, ok := got[name]; !ok {
			t.Errorf("expected subcommand %q not found", name)
		}
	}
}
