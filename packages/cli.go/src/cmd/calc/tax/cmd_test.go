package tax

import (
	"testing"
)

func TestNewCmd(t *testing.T) {
	cmd := NewCmd()
	if cmd.Use != "tax" {
		t.Errorf("Use = %q, want %q", cmd.Use, "tax")
	}
	if cmd.Short != "Calculate Vietnam personal income tax" {
		t.Errorf("Short = %q, want %q", cmd.Short, "Calculate Vietnam personal income tax")
	}
	if cmd.RunE == nil {
		t.Error("RunE must not be nil")
	}
	if cmd.Flag("income") == nil {
		t.Error("expected --income flag")
	}
	if cmd.Flag("mode") == nil {
		t.Error("expected --mode flag")
	}
}
