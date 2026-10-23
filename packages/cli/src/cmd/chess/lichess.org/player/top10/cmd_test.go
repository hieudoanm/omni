package top10

import (
	"testing"
)

func TestNewCmd(t *testing.T) {
	cmd := NewCmd()
	if cmd == nil {
		t.Fatal("NewCmd() returned nil")
	}
	if cmd.Use != "top10" {
		t.Errorf("Use = %q, want %q", cmd.Use, "top10")
	}
}
