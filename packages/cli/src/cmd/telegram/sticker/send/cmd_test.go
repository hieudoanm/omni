package send

import "testing"

func TestNewCmd_Send(t *testing.T) {
	cmd := NewCmd()
	if cmd.Use != "send" {
		t.Errorf("Use = %q, want 'send'", cmd.Use)
	}
	if cmd.Short != "Send a sticker" {
		t.Errorf("Short = %q", cmd.Short)
	}
	if cmd.RunE == nil {
		t.Error("RunE is nil, expected a function")
	}
}
