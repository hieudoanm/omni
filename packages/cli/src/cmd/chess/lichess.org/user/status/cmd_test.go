package status

import (
	"testing"
)

func TestNewCmd(t *testing.T) {
	cmd := NewCmd()
	if cmd == nil {
		t.Fatal("NewCmd() returned nil")
	}
	if cmd.Use != "status [usernames...]" {
		t.Errorf("Use = %q, want %q", cmd.Use, "status [usernames...]")
	}
}
