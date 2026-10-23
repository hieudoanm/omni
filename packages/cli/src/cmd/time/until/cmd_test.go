package until

import (
	"testing"
)

func TestNewCmd_Structure(t *testing.T) {
	cmd := NewCmd()
	if cmd.Use != "until [--time <datetime>]" {
		t.Errorf("expected Use 'until [--time <datetime>]', got %q", cmd.Use)
	}
	if cmd.Short != "Countdown to a specific date/time" {
		t.Errorf("expected Short 'Countdown to a specific date/time', got %q", cmd.Short)
	}
	if cmd.Flag("time") == nil {
		t.Error("expected --time flag")
	}
}
