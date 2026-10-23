package ftype

import (
	"testing"
)

func TestNewCommand_Use(t *testing.T) {
	cmd := NewCommand()
	if cmd.Use != "type [--file <path>]" {
		t.Errorf("Use = %q", cmd.Use)
	}
	if cmd.Short != "Detect file type by extension" {
		t.Errorf("Short = %q", cmd.Short)
	}
}

func TestNewCommand_Flags(t *testing.T) {
	cmd := NewCommand()
	_, err := cmd.Flags().GetString("file")
	if err != nil {
		t.Error("expected --file flag")
	}
}
