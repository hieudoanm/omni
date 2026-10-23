package by_id

import (
	"testing"
)

func TestNewCmd(t *testing.T) {
	cmd := NewCmd()
	if cmd == nil {
		t.Fatal("NewCmd() returned nil")
	}
	if cmd.Use != "by-id [puzzle-id]" {
		t.Errorf("Use = %q, want %q", cmd.Use, "by-id [puzzle-id]")
	}
}
