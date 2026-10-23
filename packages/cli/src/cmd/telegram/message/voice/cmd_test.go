package voice

import "testing"

func TestNewCmd_Voice(t *testing.T) {
	cmd := NewCmd()
	if cmd.Use != "voice" {
		t.Errorf("Use = %q, want 'voice'", cmd.Use)
	}
	if cmd.Short != "Send a voice message" {
		t.Errorf("Short = %q", cmd.Short)
	}
	if cmd.RunE == nil {
		t.Error("RunE is nil, expected a function")
	}
}
