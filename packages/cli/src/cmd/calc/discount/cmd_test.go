package discount

import (
	"testing"
)

func TestNewCmd_Structure(t *testing.T) {
	cmd := NewCmd()
	if cmd.Use != "discount" {
		t.Errorf("Use = %q, want %q", cmd.Use, "discount")
	}
	if cmd.Short != "Calculate discount and sale price" {
		t.Errorf("Short = %q, want %q", cmd.Short, "Calculate discount and sale price")
	}
	if cmd.RunE == nil {
		t.Error("RunE must not be nil")
	}
	if f := cmd.Flags().Lookup("original"); f == nil {
		t.Error("expected --original flag")
	}
	if f := cmd.Flags().Lookup("percent"); f == nil {
		t.Error("expected --percent flag")
	}
}
