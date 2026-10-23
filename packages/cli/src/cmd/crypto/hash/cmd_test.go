package hash

import "testing"

func TestNewCommand_Use(t *testing.T) {
	cmd := NewCommand()
	if cmd.Use != "hash" {
		t.Errorf("got Use %q, want %q", cmd.Use, "hash")
	}
	if cmd.Short != "Compute hashes of text or files" {
		t.Errorf("got Short %q, want %q", cmd.Short, "Compute hashes of text or files")
	}
}

func TestNewCommand_Flags(t *testing.T) {
	cmd := NewCommand()
	tests := []struct {
		name     string
		defValue string
		typ      string
	}{
		{"algo", "sha256", "string"},
		{"text", "", "string"},
		{"key", "", "string"},
		{"check", "false", "bool"},
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
