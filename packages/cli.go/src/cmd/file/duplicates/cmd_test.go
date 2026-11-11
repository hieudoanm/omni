package duplicates

import (
	"testing"
)

func TestNewCommand_Use(t *testing.T) {
	cmd := NewCommand()
	if cmd.Use != "duplicates [--dir <path>]" {
		t.Errorf("Use = %q", cmd.Use)
	}
	if cmd.Short != "Find duplicate files by size and partial hash" {
		t.Errorf("Short = %q", cmd.Short)
	}
}

func TestNewCommand_Flags(t *testing.T) {
	cmd := NewCommand()
	_, err := cmd.Flags().GetString("dir")
	if err != nil {
		t.Error("expected --dir flag")
	}
	_, err = cmd.Flags().GetInt64("min-size")
	if err != nil {
		t.Error("expected --min-size flag")
	}
}
