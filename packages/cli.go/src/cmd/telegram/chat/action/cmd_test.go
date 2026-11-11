package action

import "testing"

func TestNewCmd_Action(t *testing.T) {
	cmd := NewCmd()
	if cmd.Use != "action" {
		t.Errorf("Use = %q, want 'action'", cmd.Use)
	}
	if cmd.Short != "Send a chat action" {
		t.Errorf("Short = %q", cmd.Short)
	}
	if cmd.RunE == nil {
		t.Error("RunE is nil, expected a function")
	}
}
