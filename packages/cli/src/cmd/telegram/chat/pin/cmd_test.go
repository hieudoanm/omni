package pin

import "testing"

func TestNewCmd_Pin(t *testing.T) {
	cmd := NewCmd()
	if cmd.Use != "pin" {
		t.Errorf("Use = %q, want 'pin'", cmd.Use)
	}
	if cmd.Short != "Pin a message in a chat" {
		t.Errorf("Short = %q", cmd.Short)
	}
	if cmd.RunE == nil {
		t.Error("RunE is nil, expected a function")
	}
}
