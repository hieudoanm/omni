package timer

import (
	"testing"
)

func TestNewCmd_Structure(t *testing.T) {
	cmd := NewCmd()
	if cmd.Use != "timer [--duration <duration>]" {
		t.Errorf("expected Use 'timer [--duration <duration>]', got %q", cmd.Use)
	}
	if cmd.Short != "Simple countdown timer" {
		t.Errorf("expected Short 'Simple countdown timer', got %q", cmd.Short)
	}
	if cmd.Flag("duration") == nil {
		t.Error("expected --duration flag")
	}
	if cmd.Flag("json") == nil {
		t.Error("expected --json flag")
	}
}
