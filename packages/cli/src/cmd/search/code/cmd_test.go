package code

import (
	"testing"
)

func TestNewCmd_Structure(t *testing.T) {
	cmd := NewCommand()
	if cmd.Use != "code [--symbol <symbol>] [--dir <dir>]" {
		t.Errorf("Use = %q", cmd.Use)
	}
	if cmd.Short != "Search for code symbols (functions, types, variables)" {
		t.Errorf("Short = %q", cmd.Short)
	}
	if f := cmd.Flags().Lookup("symbol"); f == nil {
		t.Error("expected --symbol flag")
	}
	if f := cmd.Flags().Lookup("dir"); f == nil {
		t.Error("expected --dir flag")
	}
	if f := cmd.Flags().Lookup("lang"); f == nil {
		t.Error("expected --lang flag")
	}
	if f := cmd.Flags().Lookup("kind"); f == nil {
		t.Error("expected --kind flag")
	}
	if f := cmd.Flags().Lookup("max-results"); f == nil {
		t.Error("expected --max-results flag")
	}
}
