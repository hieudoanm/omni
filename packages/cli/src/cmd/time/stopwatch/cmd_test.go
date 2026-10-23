package stopwatch

import (
	"testing"
)

func TestNewCmd_Structure(t *testing.T) {
	cmd := NewCmd()
	if cmd.Use != "stopwatch" {
		t.Errorf("expected Use 'stopwatch', got %q", cmd.Use)
	}
	if cmd.Short != "Measure elapsed time like a stopwatch" {
		t.Errorf("expected Short 'Measure elapsed time like a stopwatch', got %q", cmd.Short)
	}
	if cmd.Flag("json") == nil {
		t.Error("expected --json flag")
	}
}
