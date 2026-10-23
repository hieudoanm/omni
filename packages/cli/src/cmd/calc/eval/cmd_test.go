package eval

import (
	"testing"
)

func TestNewCmd_Structure(t *testing.T) {
	cmd := NewCmd()
	if cmd.Use != "eval [--expression <expression>]" {
		t.Errorf("Use = %q, want %q", cmd.Use, "eval [--expression <expression>]")
	}
	if cmd.Short != "Evaluate a mathematical expression" {
		t.Errorf("Short = %q, want %q", cmd.Short, "Evaluate a mathematical expression")
	}
	if cmd.RunE == nil {
		t.Error("RunE must not be nil")
	}
	if f := cmd.Flags().Lookup("expression"); f == nil {
		t.Error("expected --expression flag")
	}
}
