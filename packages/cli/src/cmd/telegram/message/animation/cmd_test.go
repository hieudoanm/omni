package animation

import "testing"

func TestNewCmd_Animation(t *testing.T) {
	cmd := NewCmd()
	if cmd.Use != "animation" {
		t.Errorf("Use = %q, want 'animation'", cmd.Use)
	}
	if cmd.Short != "Send an animation (GIF)" {
		t.Errorf("Short = %q", cmd.Short)
	}
	if cmd.RunE == nil {
		t.Error("RunE is nil, expected a function")
	}
}
