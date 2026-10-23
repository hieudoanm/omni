package leaderboard

import (
	"testing"
)

func TestNewCmd(t *testing.T) {
	cmd := NewCmd()
	if cmd == nil {
		t.Fatal("NewCmd() returned nil")
	}
	if cmd.Use != "leaderboard [perf-type] [count]" {
		t.Errorf("Use = %q, want %q", cmd.Use, "leaderboard [perf-type] [count]")
	}
}
