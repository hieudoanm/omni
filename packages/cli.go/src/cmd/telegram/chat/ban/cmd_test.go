package ban

import "testing"

func TestNewCmd_Ban(t *testing.T) {
	cmd := NewCmd()
	if cmd.Use != "ban" {
		t.Errorf("Use = %q, want 'ban'", cmd.Use)
	}
	if cmd.Short != "Ban a user from a chat" {
		t.Errorf("Short = %q", cmd.Short)
	}
	if cmd.RunE == nil {
		t.Error("RunE is nil, expected a function")
	}
}
