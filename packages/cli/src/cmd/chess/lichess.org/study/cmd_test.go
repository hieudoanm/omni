package study

import (
	"testing"
)

func TestNewCmd(t *testing.T) {
	cmd := NewCmd()
	if cmd == nil {
		t.Fatal("NewCmd() returned nil")
	}
	if cmd.Use != "study [study-id]" {
		t.Errorf("Use = %q, want %q", cmd.Use, "study [study-id]")
	}
}
