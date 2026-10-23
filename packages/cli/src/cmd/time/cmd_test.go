package time

import (
	"testing"

	"github.com/spf13/cobra"
)

func TestNewCommand(t *testing.T) {
	cmd := NewCommand()
	if cmd.Use != "time" {
		t.Errorf("expected Use 'time', got %q", cmd.Use)
	}

	expected := []string{"clock", "cron", "epoch", "pomodoro", "timer", "until", "world", "age", "stopwatch"}
	subs := subcommandNames(cmd)
	for _, name := range expected {
		if !contains(subs, name) {
			t.Errorf("expected subcommand %q not found", name)
		}
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
