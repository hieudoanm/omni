package text

import (
	"testing"
)

func TestNewCmd(t *testing.T) {
	cmd := NewCmd()
	if cmd.Use != "text <file>" {
		t.Errorf("Use = %q, want %q", cmd.Use, "text <file>")
	}
	if cmd.Args == nil {
		t.Fatal("expected Args validator")
	}
	tests := []struct {
		name     string
		flag     string
		defValue string
	}{
		{"--text flag", "text", ""},
		{"--x flag", "x", "10"},
		{"--y flag", "y", "10"},
		{"--size flag", "size", "24"},
		{"--color flag", "color", "white"},
		{"--output flag", "output", ""},
	}
	for _, tt := range tests {
		flag := cmd.Flags().Lookup(tt.flag)
		if flag == nil {
			t.Fatalf("missing flag: %s", tt.name)
		}
		if flag.DefValue != tt.defValue {
			t.Errorf("%s default = %q, want %q", tt.name, flag.DefValue, tt.defValue)
		}
	}
}
