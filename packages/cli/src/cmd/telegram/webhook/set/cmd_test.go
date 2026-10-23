package set

import "testing"

func TestNewCmd_Set(t *testing.T) {
	cmd := NewCmd()
	if cmd.Use != "set" {
		t.Errorf("Use = %q, want 'set'", cmd.Use)
	}
	if cmd.Short != "Set a Telegram webhook URL" {
		t.Errorf("Short = %q", cmd.Short)
	}
	if cmd.RunE == nil {
		t.Error("RunE is nil, expected a function")
	}
}
