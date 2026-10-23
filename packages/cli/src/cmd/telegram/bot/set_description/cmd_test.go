package set_description

import "testing"

func TestNewCmd_SetDescription(t *testing.T) {
	cmd := NewCmd()
	if cmd.Use != "set-description" {
		t.Errorf("Use = %q, want 'set-description'", cmd.Use)
	}
	if cmd.Short != "Set bot description" {
		t.Errorf("Short = %q", cmd.Short)
	}
	if cmd.RunE == nil {
		t.Error("RunE is nil, expected a function")
	}
}
