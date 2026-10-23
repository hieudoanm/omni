package info

import (
	"testing"
)

func TestNewCmd(t *testing.T) {
	cmd := NewCmd()
	if cmd.Use != "info <file>" {
		t.Errorf("Use = %q, want %q", cmd.Use, "info <file>")
	}
}
