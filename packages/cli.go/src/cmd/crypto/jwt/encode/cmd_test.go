package encode

import "testing"

func TestNewCmd_Use(t *testing.T) {
	cmd := NewCmd()
	if cmd.Use != "encode" {
		t.Errorf("got Use %q, want %q", cmd.Use, "encode")
	}
	if cmd.Short != "Encode and sign a JWT token" {
		t.Errorf("got Short %q, want %q", cmd.Short, "Encode and sign a JWT token")
	}
}

func TestNewCmd_Flags(t *testing.T) {
	cmd := NewCmd()
	tests := []struct {
		name     string
		defValue string
		typ      string
	}{
		{"algorithm", "HS256", "string"},
		{"key", "", "string"},
		{"claims", "", "string"},
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
