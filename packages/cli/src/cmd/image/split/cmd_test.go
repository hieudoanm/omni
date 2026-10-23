package split

import (
	"testing"
)

func TestNewCmd(t *testing.T) {
	cmd := NewCmd()
	if cmd.Use != "split <file>" {
		t.Errorf("Use = %q, want %q", cmd.Use, "split <file>")
	}
	if cmd.Args == nil {
		t.Fatal("expected Args validator")
	}
	tests := []struct {
		name     string
		flag     string
		defValue string
	}{
		{"--rows flag", "rows", "2"},
		{"--cols flag", "cols", "2"},
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
