package stats

import (
	"testing"
)

func TestNewCommand_Use(t *testing.T) {
	cmd := NewCommand()
	if cmd.Use != "stats [--dir <path>]" {
		t.Errorf("Use = %q", cmd.Use)
	}
	if cmd.Short != "Show file statistics by extension" {
		t.Errorf("Short = %q", cmd.Short)
	}
}

func TestNewCommand_Flags(t *testing.T) {
	cmd := NewCommand()
	_, err := cmd.Flags().GetString("dir")
	if err != nil {
		t.Error("expected --dir flag")
	}
}
