package head

import (
	"testing"
)

func TestNewCommand_Use(t *testing.T) {
	cmd := NewCommand()
	if cmd.Use != "head [--file <path>]" {
		t.Errorf("Use = %q", cmd.Use)
	}
	if cmd.Short != "Show the first N lines of a file" {
		t.Errorf("Short = %q", cmd.Short)
	}
}

func TestNewCommand_Flags(t *testing.T) {
	cmd := NewCommand()
	_, err := cmd.Flags().GetString("file")
	if err != nil {
		t.Error("expected --file flag")
	}
	_, err = cmd.Flags().GetInt("lines")
	if err != nil {
		t.Error("expected --lines flag")
	}
}
