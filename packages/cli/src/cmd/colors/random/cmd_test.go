package random

import (
	"testing"
)

func TestCmd_Structure(t *testing.T) {
	cmd := newCmd()
	if cmd.Use != "random" {
		t.Errorf("Use = %q, want %q", cmd.Use, "random")
	}
	if cmd.Short != "Generate random HEX colors with RGB preview" {
		t.Errorf("Short = %q, want %q", cmd.Short, "Generate random HEX colors with RGB preview")
	}
	if cmd.RunE == nil {
		t.Error("RunE is nil")
	}
	flag := cmd.Flag("max")
	if flag == nil {
		t.Fatal("expected --max flag")
	}
	if flag.DefValue != "1" {
		t.Errorf("--max default = %q, want %q", flag.DefValue, "1")
	}
	if flag.Shorthand != "m" {
		t.Errorf("--max shorthand = %q, want %q", flag.Shorthand, "m")
	}
}
