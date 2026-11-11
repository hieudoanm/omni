package unit

import (
	"testing"
)

func TestNewCmd_Structure(t *testing.T) {
	cmd := NewCmd()
	if cmd.Use != "unit" {
		t.Errorf("Use = %q, want %q", cmd.Use, "unit")
	}
	if cmd.Short != "Convert between units (length, weight, temp, speed)" {
		t.Errorf("Short = %q, want %q", cmd.Short, "Convert between units (length, weight, temp, speed)")
	}
	if cmd.RunE == nil {
		t.Error("RunE must not be nil")
	}
	if f := cmd.Flags().Lookup("value"); f == nil {
		t.Error("expected --value flag")
	}
	if f := cmd.Flags().Lookup("from"); f == nil {
		t.Error("expected --from flag")
	}
	if f := cmd.Flags().Lookup("to"); f == nil {
		t.Error("expected --to flag")
	}
}
