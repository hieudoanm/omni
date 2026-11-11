package passwd

import "testing"

func TestNewCommand_Use(t *testing.T) {
	cmd := NewCommand()
	if cmd.Use != "passwd" {
		t.Errorf("got Use %q, want %q", cmd.Use, "passwd")
	}
	if cmd.Short != "Generate secure random passwords" {
		t.Errorf("got Short %q, want %q", cmd.Short, "Generate secure random passwords")
	}
}

func TestNewCommand_Flags(t *testing.T) {
	cmd := NewCommand()
	tests := []struct {
		name     string
		defValue string
		typ      string
	}{
		{"length", "16", "int"},
		{"count", "1", "int"},
		{"digits", "true", "bool"},
		{"symbols", "false", "bool"},
		{"no-upper", "false", "bool"},
		{"pin", "false", "bool"},
		{"clip", "false", "bool"},
		{"pronounceable", "false", "bool"},
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
