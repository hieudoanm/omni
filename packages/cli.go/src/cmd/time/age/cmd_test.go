package age

import (
	"testing"
)

func TestNewCmd_Structure(t *testing.T) {
	cmd := NewCmd()
	if cmd.Use != "age [--date <birthdate>]" {
		t.Errorf("expected Use 'age [--date <birthdate>]', got %q", cmd.Use)
	}
	if cmd.Short != "Calculate age from a birthdate" {
		t.Errorf("expected Short 'Calculate age from a birthdate', got %q", cmd.Short)
	}
	if cmd.Flag("date") == nil {
		t.Error("expected --date flag")
	}
	if cmd.Flag("json") == nil {
		t.Error("expected --json flag")
	}
}
