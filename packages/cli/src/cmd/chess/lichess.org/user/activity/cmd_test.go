package activity

import (
	"testing"
)

func TestNewCmd(t *testing.T) {
	cmd := NewCmd()
	if cmd == nil {
		t.Fatal("NewCmd() returned nil")
	}
	if cmd.Use != "activity [username]" {
		t.Errorf("Use = %q, want %q", cmd.Use, "activity [username]")
	}
}
