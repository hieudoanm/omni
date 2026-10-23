package totp

import "testing"

func TestNewCommand_Use(t *testing.T) {
	cmd := NewCommand()
	if cmd.Use != "totp [--secret <secret>]" {
		t.Errorf("got Use %q, want %q", cmd.Use, "totp [--secret <secret>]")
	}
	if cmd.Short != "Generate a TOTP code from a Base32 secret" {
		t.Errorf("got Short %q, want %q", cmd.Short, "Generate a TOTP code from a Base32 secret")
	}
}

func TestNewCommand_Flags(t *testing.T) {
	cmd := NewCommand()
	tests := []struct {
		name     string
		defValue string
		typ      string
	}{
		{"secret", "", "string"},
		{"step", "30", "int"},
		{"digits", "6", "int"},
		{"time", "", "string"},
		{"json", "false", "bool"},
	}
	for _, tt := range tests {
		f := cmd.Flag(tt.name)
		if f == nil {
			t.Errorf("missing flag: %s", tt.name)
			continue
		}
		if f.DefValue != tt.defValue {
			t.Errorf("flag %s: got DefValue %q, want %q", tt.name, f.DefValue, tt.defValue)
		}
		if f.Value.Type() != tt.typ {
			t.Errorf("flag %s: got type %q, want %q", tt.name, f.Value.Type(), tt.typ)
		}
	}
}
