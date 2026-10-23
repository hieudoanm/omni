package random

import (
	"testing"
)

func TestNewCmd_Structure(t *testing.T) {
	cmd := NewCmd()
	if cmd.Use != "random" {
		t.Errorf("Use = %q, want %q", cmd.Use, "random")
	}
	if cmd.Short != "Generate random numbers" {
		t.Errorf("Short = %q, want %q", cmd.Short, "Generate random numbers")
	}
	if cmd.RunE == nil {
		t.Error("RunE must not be nil")
	}
	if f := cmd.Flags().Lookup("min"); f == nil {
		t.Error("expected --min flag")
	}
	if f := cmd.Flags().Lookup("max"); f == nil {
		t.Error("expected --max flag")
	}
	if f := cmd.Flags().Lookup("count"); f == nil {
		t.Error("expected --count flag")
	}
}
