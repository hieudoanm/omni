package edit

import "testing"

func TestNewCmd_Edit(t *testing.T) {
	cmd := NewCmd()
	if cmd.Use != "edit" {
		t.Errorf("Use = %q, want 'edit'", cmd.Use)
	}
	if cmd.Short != "Edit a message text" {
		t.Errorf("Short = %q", cmd.Short)
	}
	if cmd.RunE == nil {
		t.Error("RunE is nil, expected a function")
	}
}
