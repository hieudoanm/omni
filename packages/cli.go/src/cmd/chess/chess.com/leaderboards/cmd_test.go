package leaderboards

import (
	"testing"
)

func TestNewCmd(t *testing.T) {
	cmd := NewCmd()
	if cmd == nil {
		t.Fatal("NewCmd() returned nil")
	}
	if cmd.Use != "leaderboards" {
		t.Errorf("Use = %q, want %q", cmd.Use, "leaderboards")
	}
}
