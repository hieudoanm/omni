package decode

import "testing"

func TestNewCmd_Use(t *testing.T) {
	cmd := NewCmd()
	if cmd.Use != "decode [--token <token>]" {
		t.Errorf("got Use %q, want %q", cmd.Use, "decode [--token <token>]")
	}
	if cmd.Short != "Decode a JWT token without signature verification" {
		t.Errorf("got Short %q, want %q", cmd.Short, "Decode a JWT token without signature verification")
	}
}

func TestNewCmd_Flags(t *testing.T) {
	cmd := NewCmd()
	tests := []struct {
		name     string
		defValue string
		typ      string
	}{
		{"token", "", "string"},
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
