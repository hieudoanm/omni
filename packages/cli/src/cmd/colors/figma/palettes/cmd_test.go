package palettes

import "testing"

func TestNewCommand(t *testing.T) {
	cmd := NewCommand()
	if cmd.Use != "palettes" {
		t.Errorf("Use = %q, want %q", cmd.Use, "palettes")
	}
	if cmd.Short != "Display all color palettes with their colors" {
		t.Errorf("Short = %q, want %q", cmd.Short, "Display all color palettes with their colors")
	}
	if cmd.RunE == nil {
		t.Error("RunE is nil")
	}
}
