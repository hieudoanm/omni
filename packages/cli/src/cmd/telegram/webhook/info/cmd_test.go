package info

import "testing"

func TestNewCmd_Info(t *testing.T) {
	cmd := NewCmd()
	if cmd.Use != "info" {
		t.Errorf("Use = %q, want 'info'", cmd.Use)
	}
	if cmd.Short != "Get current webhook info" {
		t.Errorf("Short = %q", cmd.Short)
	}
	if cmd.RunE == nil {
		t.Error("RunE is nil, expected a function")
	}
}
