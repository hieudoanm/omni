package tip

import (
	"testing"
)

func TestNewCmd_Structure(t *testing.T) {
	cmd := NewCmd()
	if cmd.Use != "tip" {
		t.Errorf("Use = %q, want %q", cmd.Use, "tip")
	}
	if cmd.Short != "Calculate tip and split bill" {
		t.Errorf("Short = %q, want %q", cmd.Short, "Calculate tip and split bill")
	}
	if cmd.RunE == nil {
		t.Error("RunE must not be nil")
	}
	if f := cmd.Flags().Lookup("bill"); f == nil {
		t.Error("expected --bill flag")
	}
	if f := cmd.Flags().Lookup("percent"); f == nil {
		t.Error("expected --percent flag")
	}
	if f := cmd.Flags().Lookup("split"); f == nil {
		t.Error("expected --split flag")
	}
}
