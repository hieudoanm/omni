package play

import "testing"

func TestNewCmd(t *testing.T) {
	cmd := NewCmd()
	if cmd.Use != "play" {
		t.Errorf("Use = %q, want %q", cmd.Use, "play")
	}
}
