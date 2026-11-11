package cobra

import (
	"testing"
)

func TestNewCmd(t *testing.T) {
	cmd := NewCmd()
	if cmd.Use != "cobra [--file <path>]" {
		t.Errorf("Use = %q, want %q", cmd.Use, "cobra [--file <path>]")
	}
	if cmd.Short != "Generate README.md documentation from a Cobra CLI project" {
		t.Errorf("Short = %q, want %q", cmd.Short, "Generate README.md documentation from a Cobra CLI project")
	}
	if cmd.Example == "" {
		t.Error("Example should not be empty")
	}
	if cmd.RunE == nil {
		t.Error("RunE should not be nil")
	}
	fileFlag := cmd.Flags().Lookup("file")
	if fileFlag == nil {
		t.Error("expected --file flag")
	}
	outputFlag := cmd.Flags().Lookup("output")
	if outputFlag == nil {
		t.Error("expected --output flag")
	}
}
