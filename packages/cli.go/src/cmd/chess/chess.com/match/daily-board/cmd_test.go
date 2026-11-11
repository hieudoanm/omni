package dailyboard

import (
	"testing"
)

func TestNewCmd(t *testing.T) {
	cmd := NewCmd()
	if cmd == nil {
		t.Fatal("NewCmd() returned nil")
	}
	if cmd.Use != "daily-board" {
		t.Errorf("Use = %q, want %q", cmd.Use, "daily-board")
	}
}
