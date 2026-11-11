package profile

import (
	"testing"
)

func TestNewCmd(t *testing.T) {
	cmd := NewCmd()
	if cmd == nil {
		t.Fatal("NewCmd() returned nil")
	}
	if cmd.Use != "profile [username]" {
		t.Errorf("Use = %q, want %q", cmd.Use, "profile [username]")
	}
}
