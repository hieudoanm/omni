package stats

import (
	"testing"
)

func TestNewCmd_Structure(t *testing.T) {
	cmd := NewCmd()
	if cmd.Use != "stats [--values <n1,n2,...>]" {
		t.Errorf("Use = %q, want %q", cmd.Use, "stats [--values <n1,n2,...>]")
	}
	if cmd.Short != "Statistical summary of numbers" {
		t.Errorf("Short = %q, want %q", cmd.Short, "Statistical summary of numbers")
	}
	if cmd.RunE == nil {
		t.Error("RunE must not be nil")
	}
	if f := cmd.Flags().Lookup("values"); f == nil {
		t.Error("expected --values flag")
	}
}
