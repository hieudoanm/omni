package round

import (
	"testing"
)

func TestNewCmd(t *testing.T) {
	cmd := NewCmd()
	if cmd == nil {
		t.Fatal("NewCmd() returned nil")
	}
	if cmd.Use != "round" {
		t.Errorf("Use = %q, want %q", cmd.Use, "round")
	}
}
