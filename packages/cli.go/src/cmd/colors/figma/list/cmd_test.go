package list

import "testing"

func TestNewCommand(t *testing.T) {
	cmd := NewCommand()
	if cmd.Use != "list" {
		t.Errorf("Use = %q, want %q", cmd.Use, "list")
	}
	if cmd.Short != "List all palette names from the Figma color directory" {
		t.Errorf("Short = %q, want %q", cmd.Short, "List all palette names from the Figma color directory")
	}
	if cmd.RunE == nil {
		t.Error("RunE is nil")
	}
}
