package restrict

import "testing"

func TestNewCmd_Restrict(t *testing.T) {
	cmd := NewCmd()
	if cmd.Use != "restrict" {
		t.Errorf("Use = %q, want 'restrict'", cmd.Use)
	}
	if cmd.Short != "Restrict a user in a chat" {
		t.Errorf("Short = %q", cmd.Short)
	}
	if cmd.RunE == nil {
		t.Error("RunE is nil, expected a function")
	}
}
