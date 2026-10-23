package qrcode

import "testing"

func TestNewCommand_Use(t *testing.T) {
	cmd := NewCommand()
	if cmd.Use != "qrcode" {
		t.Errorf("got Use %q, want %q", cmd.Use, "qrcode")
	}
}

func TestNewCommand_HasSubcommands(t *testing.T) {
	cmd := NewCommand()
	if cmd.Commands() == nil {
		t.Fatal("expected subcommands")
	}
	names := make(map[string]bool)
	for _, c := range cmd.Commands() {
		names[c.Name()] = true
	}
	for _, want := range []string{"encode", "decode"} {
		if !names[want] {
			t.Errorf("missing subcommand: %s", want)
		}
	}
}
