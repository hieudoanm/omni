package reopen

import "testing"

func TestNewCmd_Reopen(t *testing.T) {
	cmd := NewCmd()
	if cmd.Use != "reopen" {
		t.Errorf("Use = %q, want 'reopen'", cmd.Use)
	}
	if cmd.Short != "Reopen a forum topic" {
		t.Errorf("Short = %q", cmd.Short)
	}
	if cmd.RunE == nil {
		t.Error("RunE is nil, expected a function")
	}
}
