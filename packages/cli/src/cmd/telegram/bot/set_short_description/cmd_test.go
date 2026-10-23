package set_short_description

import "testing"

func TestNewCmd_SetShortDescription(t *testing.T) {
	cmd := NewCmd()
	if cmd.Use != "set-short-description" {
		t.Errorf("Use = %q, want 'set-short-description'", cmd.Use)
	}
	if cmd.Short != "Set bot short description" {
		t.Errorf("Short = %q", cmd.Short)
	}
	if cmd.RunE == nil {
		t.Error("RunE is nil, expected a function")
	}
}
