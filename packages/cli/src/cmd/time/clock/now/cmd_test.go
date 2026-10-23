package now

import (
	"testing"
)

func TestNewCmd_Structure(t *testing.T) {
	cmd := NewCmd()
	if cmd.Use != "now" {
		t.Errorf("expected Use 'now', got %q", cmd.Use)
	}
	if cmd.Short != "Display current date and time" {
		t.Errorf("expected Short 'Display current date and time', got %q", cmd.Short)
	}
	if cmd.Flag("json") == nil {
		t.Error("expected --json flag")
	}
	if cmd.Flag("format") == nil {
		t.Error("expected --format flag")
	}
}
