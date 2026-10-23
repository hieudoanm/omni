package cheatsheet

import "testing"

func TestNewCmd(t *testing.T) {
	cmd := NewCmd()
	if cmd.Use != "cheatsheet" {
		t.Errorf("Use = %q, want %q", cmd.Use, "cheatsheet")
	}
}

func TestNewCmdAliases(t *testing.T) {
	cmd := NewCmd()
	if len(cmd.Aliases) == 0 {
		t.Error("expected aliases")
	}
}
