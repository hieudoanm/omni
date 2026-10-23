package location

import "testing"

func TestNewCmd(t *testing.T) {
	cmd := NewCmd()
	if cmd.Use != "location" {
		t.Errorf("Use = %q, want 'location'", cmd.Use)
	}
	if cmd.Short != "Send locations" {
		t.Errorf("Short = %q", cmd.Short)
	}
}
