package clock

import (
	"testing"

	"github.com/spf13/cobra"
)

func TestNewCmd_Structure(t *testing.T) {
	cmd := NewCmd()
	if cmd.Use != "clock" {
		t.Errorf("expected Use 'clock', got %q", cmd.Use)
	}
	if cmd.Short != "Clock and timer utilities" {
		t.Errorf("expected Short 'Clock and timer utilities', got %q", cmd.Short)
	}
	subs := subcommandNames(cmd)
	if !contains(subs, "now") {
		t.Error("expected subcommand 'now' not found")
	}
}

func subcommandNames(cmd *cobra.Command) []string {
	var names []string
	for _, c := range cmd.Commands() {
		names = append(names, c.Name())
	}
	return names
}

func contains(slice []string, s string) bool {
	for _, v := range slice {
		if v == s {
			return true
		}
	}
	return false
}
