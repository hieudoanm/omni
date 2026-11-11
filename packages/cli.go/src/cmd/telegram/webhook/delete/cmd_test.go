package delete

import "testing"

func TestNewCmd_Delete(t *testing.T) {
	cmd := NewCmd()
	if cmd.Use != "delete" {
		t.Errorf("Use = %q, want 'delete'", cmd.Use)
	}
	if cmd.Short != "Delete the Telegram webhook" {
		t.Errorf("Short = %q", cmd.Short)
	}
	if cmd.RunE == nil {
		t.Error("RunE is nil, expected a function")
	}
}
