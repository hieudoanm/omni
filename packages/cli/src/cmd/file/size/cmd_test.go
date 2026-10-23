package size

import (
	"testing"
)

func TestNewCommand_Use(t *testing.T) {
	cmd := NewCommand()
	if cmd.Use != "size [--path <file-or-dir>]" {
		t.Errorf("Use = %q", cmd.Use)
	}
	if cmd.Short != "Show file or directory size" {
		t.Errorf("Short = %q", cmd.Short)
	}
}

func TestNewCommand_Flags(t *testing.T) {
	cmd := NewCommand()
	_, err := cmd.Flags().GetString("path")
	if err != nil {
		t.Error("expected --path flag")
	}
}
