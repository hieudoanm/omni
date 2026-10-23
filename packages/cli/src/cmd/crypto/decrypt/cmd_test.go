package decrypt

import "testing"

func TestNewCommand_Use(t *testing.T) {
	cmd := NewCommand()
	if cmd.Use != "decrypt [--file <file>]" {
		t.Errorf("got Use %q, want %q", cmd.Use, "decrypt [--file <file>]")
	}
	if cmd.Short != "Decrypt a file encrypted with AES-256-GCM" {
		t.Errorf("got Short %q, want %q", cmd.Short, "Decrypt a file encrypted with AES-256-GCM")
	}
}

func TestNewCommand_Flags(t *testing.T) {
	cmd := NewCommand()
	tests := []struct {
		name     string
		defValue string
		typ      string
	}{
		{"file", "", "string"},
		{"password", "", "string"},
		{"output", "", "string"},
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
