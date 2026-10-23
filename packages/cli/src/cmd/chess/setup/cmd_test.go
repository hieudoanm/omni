package setup

import (
	"testing"
)

func TestNewCmd(t *testing.T) {
	cmd := NewCmd()
	if cmd.Use != "setup" {
		t.Errorf("Use = %q, want 'setup'", cmd.Use)
	}
	if cmd.Short != "Set up a specific Chess960 starting position" {
		t.Errorf("Short = %q", cmd.Short)
	}
}

func TestNewCmd_RunE_NotNil(t *testing.T) {
	cmd := NewCmd()
	if cmd.RunE == nil {
		t.Fatal("expected RunE to be set")
	}
}
