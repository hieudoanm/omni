package tojson

import (
	"testing"
)

func TestNewCmd(t *testing.T) {
	cmd := NewCmd()
	if cmd.Use != "to-json <file>" {
		t.Errorf("Use = %q, want %q", cmd.Use, "to-json <file>")
	}
	if cmd.Flag("pretty") == nil {
		t.Error("expected --pretty flag")
	}
}
