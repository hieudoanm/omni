package play

import (
	"testing"
)

func TestNewCmd(t *testing.T) {
	cmd := NewCmd()
	if cmd.Use != "play" {
		t.Errorf("Use = %q, want 'play'", cmd.Use)
	}
	if cmd.Short != "Play chess interactively in the terminal" {
		t.Errorf("Short = %q", cmd.Short)
	}
	if cmd.Flag("blind") == nil {
		t.Error("expected --blind flag")
	}
}

func TestNewCmd_RunE_NotNil(t *testing.T) {
	cmd := NewCmd()
	if cmd.RunE == nil {
		t.Fatal("expected RunE to be set")
	}
}
