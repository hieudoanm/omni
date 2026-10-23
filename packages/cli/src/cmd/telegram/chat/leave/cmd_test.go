package leave

import "testing"

func TestNewCmd_Leave(t *testing.T) {
	cmd := NewCmd()
	if cmd.Use != "leave" {
		t.Errorf("Use = %q, want 'leave'", cmd.Use)
	}
	if cmd.Short != "Leave a chat" {
		t.Errorf("Short = %q", cmd.Short)
	}
	if cmd.RunE == nil {
		t.Error("RunE is nil, expected a function")
	}
}
