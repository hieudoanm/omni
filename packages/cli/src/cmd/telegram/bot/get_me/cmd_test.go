package get_me

import "testing"

func TestNewCmd_GetMe(t *testing.T) {
	cmd := NewCmd()
	if cmd.Use != "get-me" {
		t.Errorf("Use = %q, want 'get-me'", cmd.Use)
	}
	if cmd.Short != "Get bot info" {
		t.Errorf("Short = %q", cmd.Short)
	}
	if cmd.RunE == nil {
		t.Error("RunE is nil, expected a function")
	}
}
