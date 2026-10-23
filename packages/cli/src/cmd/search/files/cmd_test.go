package files

import (
	"testing"
)

func TestNewCmd_Structure(t *testing.T) {
	cmd := NewCommand()
	if cmd.Use != "files [--pattern <pattern>] [--dir <dir>]" {
		t.Errorf("Use = %q", cmd.Use)
	}
	if f := cmd.Flags().Lookup("pattern"); f == nil {
		t.Error("expected --pattern flag")
	}
	if f := cmd.Flags().Lookup("dir"); f == nil {
		t.Error("expected --dir flag")
	}
	if f := cmd.Flags().Lookup("max-depth"); f == nil {
		t.Error("expected --max-depth flag")
	}
	if f := cmd.Flags().Lookup("type"); f == nil {
		t.Error("expected --type flag")
	}
	if f := cmd.Flags().Lookup("hidden"); f == nil {
		t.Error("expected --hidden flag")
	}
}
