package age

import (
	"testing"
)

func TestNewCmd_Structure(t *testing.T) {
	cmd := NewCmd()
	if cmd.Use != "age" {
		t.Errorf("Use = %q, want %q", cmd.Use, "age")
	}
	if cmd.Short != "Calculate age from birth date" {
		t.Errorf("Short = %q, want %q", cmd.Short, "Calculate age from birth date")
	}
	if cmd.RunE == nil {
		t.Error("RunE must not be nil")
	}
	if f := cmd.Flags().Lookup("year"); f == nil {
		t.Error("expected --year flag")
	}
	if f := cmd.Flags().Lookup("month"); f == nil {
		t.Error("expected --month flag")
	}
	if f := cmd.Flags().Lookup("day"); f == nil {
		t.Error("expected --day flag")
	}
}
