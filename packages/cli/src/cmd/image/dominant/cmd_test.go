package dominant

import (
	"testing"
)

func TestNewCmd(t *testing.T) {
	cmd := NewCmd()
	if cmd.Use != "dominant <file>" {
		t.Errorf("Use = %q, want %q", cmd.Use, "dominant <file>")
	}
	if cmd.Args == nil {
		t.Fatal("expected Args validator")
	}
	flag := cmd.Flags().Lookup("top")
	if flag == nil {
		t.Fatal("expected --top flag")
	}
	if flag.DefValue != "5" {
		t.Errorf("--top default = %q, want %q", flag.DefValue, "5")
	}
}
