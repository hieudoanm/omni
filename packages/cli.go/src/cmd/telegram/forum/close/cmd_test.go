package close

import "testing"

func TestNewCmd_Close(t *testing.T) {
	cmd := NewCmd()
	if cmd.Use != "close" {
		t.Errorf("Use = %q, want 'close'", cmd.Use)
	}
	if cmd.Short != "Close a forum topic" {
		t.Errorf("Short = %q", cmd.Short)
	}
	if cmd.RunE == nil {
		t.Error("RunE is nil, expected a function")
	}
}
