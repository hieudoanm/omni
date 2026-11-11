package contact

import "testing"

func TestNewCmd(t *testing.T) {
	cmd := NewCmd()
	if cmd.Use != "contact" {
		t.Errorf("Use = %q, want 'contact'", cmd.Use)
	}
	if cmd.Short != "Send contacts" {
		t.Errorf("Short = %q", cmd.Short)
	}
}
