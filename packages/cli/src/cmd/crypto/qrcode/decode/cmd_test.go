package decode

import "testing"

func TestNewCommand_Use(t *testing.T) {
	cmd := NewCommand()
	if cmd.Use != "decode <image>" {
		t.Errorf("got Use %q, want %q", cmd.Use, "decode <image>")
	}
}

func TestNewCommand_Args(t *testing.T) {
	cmd := NewCommand()
	if cmd.Args == nil {
		t.Fatal("expected Args validation")
	}
}
