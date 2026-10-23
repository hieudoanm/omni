package set_keywords

import "testing"

func TestNewCmd_SetKeywords(t *testing.T) {
	cmd := NewCmd()
	if cmd.Use != "set-keywords" {
		t.Errorf("Use = %q, want 'set-keywords'", cmd.Use)
	}
	if cmd.Short != "Set sticker keywords" {
		t.Errorf("Short = %q", cmd.Short)
	}
	if cmd.RunE == nil {
		t.Error("RunE is nil, expected a function")
	}
}
