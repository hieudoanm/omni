package percent

import (
	"testing"
)

func TestNewCmd_Structure(t *testing.T) {
	cmd := NewCmd()
	if cmd.Use != "percent" {
		t.Errorf("Use = %q, want %q", cmd.Use, "percent")
	}
	if cmd.Short != "Calculate percentages" {
		t.Errorf("Short = %q, want %q", cmd.Short, "Calculate percentages")
	}
	if cmd.RunE == nil {
		t.Error("RunE must not be nil")
	}
	if f := cmd.Flags().Lookup("value"); f == nil {
		t.Error("expected --value flag")
	}
	if f := cmd.Flags().Lookup("of"); f == nil {
		t.Error("expected --of flag")
	}
	if f := cmd.Flags().Lookup("plus"); f == nil {
		t.Error("expected --plus flag")
	}
	if f := cmd.Flags().Lookup("minus"); f == nil {
		t.Error("expected --minus flag")
	}
}
