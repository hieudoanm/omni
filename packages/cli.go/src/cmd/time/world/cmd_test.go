package world

import (
	"testing"
)

func TestNewCmd_Structure(t *testing.T) {
	cmd := NewCmd()
	if cmd.Use != "world [zone1 zone2 ...]" {
		t.Errorf("expected Use 'world [zone1 zone2 ...]', got %q", cmd.Use)
	}
	if cmd.Short != "Display current time in multiple timezones" {
		t.Errorf("expected Short 'Display current time in multiple timezones', got %q", cmd.Short)
	}
}
