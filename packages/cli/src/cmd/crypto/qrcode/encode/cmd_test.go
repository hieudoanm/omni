package encode

import "testing"

func TestNewCommand_Use(t *testing.T) {
	cmd := NewCommand()
	if cmd.Use != "encode [data]" {
		t.Errorf("got Use %q, want %q", cmd.Use, "encode [data]")
	}
	if cmd.Short != "Generate a QR code in the terminal or as a PNG image" {
		t.Errorf("got Short %q, want %q", cmd.Short, "Generate a QR code in the terminal or as a PNG image")
	}
}

func TestNewCommand_Flags(t *testing.T) {
	cmd := NewCommand()
	tests := []struct {
		name     string
		defValue string
		typ      string
	}{
		{"data", "", "string"},
		{"input", "", "string"},
		{"output", "", "string"},
		{"level", "M", "string"},
		{"quiet-zone", "1", "int"},
		{"invert", "false", "bool"},
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
