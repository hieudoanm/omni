package factorial

import (
	"testing"
)

func TestNewCmd_Structure(t *testing.T) {
	cmd := NewCmd()
	if cmd.Use != "factorial [--number <n>]" {
		t.Errorf("Use = %q, want %q", cmd.Use, "factorial [--number <n>]")
	}
	if cmd.Short != "Compute factorial of a number (n!)" {
		t.Errorf("Short = %q, want %q", cmd.Short, "Compute factorial of a number (n!)")
	}
	if cmd.RunE == nil {
		t.Error("RunE must not be nil")
	}
	if f := cmd.Flags().Lookup("number"); f == nil {
		t.Error("expected --number flag")
	}
}
