package text

import (
	"testing"
)

func TestNewCmd_Structure(t *testing.T) {
	cmd := NewCommand()
	if cmd.Use != "text [--pattern <pattern>] [--path <path>]" {
		t.Errorf("Use = %q", cmd.Use)
	}
	if cmd.Short != "Search file contents using regex" {
		t.Errorf("Short = %q", cmd.Short)
	}
	if f := cmd.Flags().Lookup("pattern"); f == nil {
		t.Error("expected --pattern flag")
	}
	if f := cmd.Flags().Lookup("path"); f == nil {
		t.Error("expected --path flag")
	}
	if f := cmd.Flags().Lookup("ignore-case"); f == nil {
		t.Error("expected --ignore-case flag")
	}
	if f := cmd.Flags().Lookup("max-count"); f == nil {
		t.Error("expected --max-count flag")
	}
	if f := cmd.Flags().Lookup("include"); f == nil {
		t.Error("expected --include flag")
	}
	if f := cmd.Flags().Lookup("max-depth"); f == nil {
		t.Error("expected --max-depth flag")
	}
}
