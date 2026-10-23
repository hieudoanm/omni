package togif

import (
	"testing"
)

func TestNewCmd(t *testing.T) {
	cmd := NewCmd()
	if cmd.Use != "to-gif <file>" {
		t.Errorf("Use = %q, want %q", cmd.Use, "to-gif <file>")
	}
	if cmd.Args == nil {
		t.Fatal("expected Args validator")
	}
	tests := []struct {
		name     string
		flag     string
		defValue string
	}{
		{"--fps flag", "fps", "10"},
		{"--width flag", "width", "480"},
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
