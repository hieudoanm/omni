package checksum

import (
	"testing"
)

func TestNewCommand_Use(t *testing.T) {
	cmd := NewCommand()
	if cmd.Use != "checksum [--file <path>]" {
		t.Errorf("Use = %q", cmd.Use)
	}
	if cmd.Short != "Compute file checksum" {
		t.Errorf("Short = %q", cmd.Short)
	}
}

func TestNewCommand_Flags(t *testing.T) {
	cmd := NewCommand()
	_, err := cmd.Flags().GetString("algorithm")
	if err != nil {
		t.Error("expected --algorithm flag")
	}
	_, err = cmd.Flags().GetString("file")
	if err != nil {
		t.Error("expected --file flag")
	}
}
