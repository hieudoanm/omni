package replace_in_set

import "testing"

func TestNewCmd_ReplaceInSet(t *testing.T) {
	cmd := NewCmd()
	if cmd.Use != "replace-in-set" {
		t.Errorf("Use = %q, want 'replace-in-set'", cmd.Use)
	}
	if cmd.Short != "Replace a sticker in a set" {
		t.Errorf("Short = %q", cmd.Short)
	}
	if cmd.RunE == nil {
		t.Error("RunE is nil, expected a function")
	}
}
