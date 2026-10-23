package date

import (
	"testing"
)

func TestNewCmd_Structure(t *testing.T) {
	cmd := NewCmd()
	if cmd.Use != "date" {
		t.Errorf("Use = %q, want %q", cmd.Use, "date")
	}
	if cmd.Short != "Date arithmetic and difference" {
		t.Errorf("Short = %q, want %q", cmd.Short, "Date arithmetic and difference")
	}
	if cmd.RunE == nil {
		t.Error("RunE must not be nil")
	}
	if f := cmd.Flags().Lookup("add"); f == nil {
		t.Error("expected --add flag")
	}
	if f := cmd.Flags().Lookup("add-months"); f == nil {
		t.Error("expected --add-months flag")
	}
	if f := cmd.Flags().Lookup("add-years"); f == nil {
		t.Error("expected --add-years flag")
	}
	if f := cmd.Flags().Lookup("diff"); f == nil {
		t.Error("expected --diff flag")
	}
	if f := cmd.Flags().Lookup("format"); f == nil {
		t.Error("expected --format flag")
	}
}
