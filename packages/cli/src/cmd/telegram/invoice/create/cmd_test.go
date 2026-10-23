package create

import "testing"

func TestNewCmd_Create(t *testing.T) {
	cmd := NewCmd()
	if cmd.Use != "create" {
		t.Errorf("Use = %q, want 'create'", cmd.Use)
	}
	if cmd.Short != "Create an invoice link" {
		t.Errorf("Short = %q", cmd.Short)
	}
	if cmd.RunE == nil {
		t.Error("RunE is nil, expected a function")
	}
}
