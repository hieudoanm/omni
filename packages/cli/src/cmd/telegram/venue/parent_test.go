package venue

import "testing"

func TestNewCmd(t *testing.T) {
	cmd := NewCmd()
	if cmd.Use != "venue" {
		t.Errorf("Use = %q, want 'venue'", cmd.Use)
	}
	if cmd.Short != "Send venues" {
		t.Errorf("Short = %q", cmd.Short)
	}
}
