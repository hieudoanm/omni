package pomodoro

import (
	"testing"
)

func TestNewCmd_Structure(t *testing.T) {
	cmd := NewCmd()
	if cmd.Use != "pomodoro" {
		t.Errorf("expected Use 'pomodoro', got %q", cmd.Use)
	}
	if cmd.Short != "Start a Pomodoro timer TUI session" {
		t.Errorf("expected Short 'Start a Pomodoro timer TUI session', got %q", cmd.Short)
	}
	if cmd.Flag("work") == nil {
		t.Error("expected --work flag")
	}
	if cmd.Flag("rest") == nil {
		t.Error("expected --rest flag")
	}
}
