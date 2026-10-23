package document

import "testing"

func TestNewCmd_Document(t *testing.T) {
	cmd := NewCmd()
	if cmd.Use != "document" {
		t.Errorf("Use = %q, want 'document'", cmd.Use)
	}
	if cmd.Short != "Send a document" {
		t.Errorf("Short = %q", cmd.Short)
	}
	if cmd.RunE == nil {
		t.Error("RunE is nil, expected a function")
	}
}
