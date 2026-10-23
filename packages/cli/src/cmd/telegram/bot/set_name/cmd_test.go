package set_name

import "testing"

func TestNewCmd_SetName(t *testing.T) {
	cmd := NewCmd()
	if cmd.Use != "set-name" {
		t.Errorf("Use = %q, want 'set-name'", cmd.Use)
	}
	if cmd.Short != "Set bot name" {
		t.Errorf("Short = %q", cmd.Short)
	}
	if cmd.RunE == nil {
		t.Error("RunE is nil, expected a function")
	}
}
