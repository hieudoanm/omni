package poll

import "testing"

func TestNewCmd(t *testing.T) {
	cmd := NewCmd()
	if cmd.Use != "poll" {
		t.Errorf("Use = %q, want 'poll'", cmd.Use)
	}
	if cmd.Short != "Send polls" {
		t.Errorf("Short = %q", cmd.Short)
	}
}
