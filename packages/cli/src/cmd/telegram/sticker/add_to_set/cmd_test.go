package add_to_set

import "testing"

func TestNewCmd_AddToSet(t *testing.T) {
	cmd := NewCmd()
	if cmd.Use != "add-to-set" {
		t.Errorf("Use = %q, want 'add-to-set'", cmd.Use)
	}
	if cmd.Short != "Add a sticker to a set" {
		t.Errorf("Short = %q", cmd.Short)
	}
	if cmd.RunE == nil {
		t.Error("RunE is nil, expected a function")
	}
}
