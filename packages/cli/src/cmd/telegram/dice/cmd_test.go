package dice

import "testing"

func TestNewCmd_UseShort(t *testing.T) {
	cmd := NewCmd()
	if cmd.Use != "dice" {
		t.Errorf("Use = %q, want 'dice'", cmd.Use)
	}
	if cmd.Short != "Send a dice" {
		t.Errorf("Short = %q", cmd.Short)
	}
	if cmd.RunE == nil {
		t.Error("RunE is nil, expected a function")
	}
}
