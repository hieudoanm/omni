package barcode

import "testing"

func TestNewCommand_Use(t *testing.T) {
	cmd := NewCommand()
	if cmd.Use != "barcode" {
		t.Errorf("got Use %q, want %q", cmd.Use, "barcode")
	}
}

func TestNewCommand_HasSubcommands(t *testing.T) {
	cmd := NewCommand()
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
