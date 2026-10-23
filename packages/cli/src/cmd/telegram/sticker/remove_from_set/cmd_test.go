package remove_from_set

import "testing"

func TestNewCmd_RemoveFromSet(t *testing.T) {
	cmd := NewCmd()
	if cmd.Use != "remove-from-set" {
		t.Errorf("Use = %q, want 'remove-from-set'", cmd.Use)
	}
	if cmd.Short != "Remove a sticker from a set" {
		t.Errorf("Short = %q", cmd.Short)
	}
	if cmd.RunE == nil {
		t.Error("RunE is nil, expected a function")
	}
}
