package models

import (
	"testing"
)

func TestNewCmd(t *testing.T) {
	cmd := NewCmd()
	if cmd.Use != "models" {
		t.Errorf("Use = %q, want %q", cmd.Use, "models")
	}
	if cmd.Flag("search") == nil {
		t.Error("expected --search flag")
	}
	if cmd.Flag("json") == nil {
		t.Error("expected --json flag")
	}
}
