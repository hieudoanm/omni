package answer

import "testing"

func TestNewCmd_Answer(t *testing.T) {
	cmd := NewCmd()
	if cmd.Use != "answer" {
		t.Errorf("Use = %q, want 'answer'", cmd.Use)
	}
	if cmd.Short != "Answer an inline query" {
		t.Errorf("Short = %q", cmd.Short)
	}
	if cmd.RunE == nil {
		t.Error("RunE is nil, expected a function")
	}
}
