package palette

import (
	"testing"
)

func TestCmd_Structure(t *testing.T) {
	cmd := newCmd()
	if cmd.Use != "palette" {
		t.Errorf("Use = %q, want %q", cmd.Use, "palette")
	}
	if cmd.Short != "Generate a color palette from a base HEX color" {
		t.Errorf("Short = %q, want %q", cmd.Short, "Generate a color palette from a base HEX color")
	}
	if cmd.RunE == nil {
		t.Error("RunE is nil")
	}
}

func TestCmd_StyleFlag(t *testing.T) {
	cmd := newCmd()
	flag := cmd.Flag("style")
	if flag == nil {
		t.Fatal("expected --style flag")
	}
	if flag.Shorthand != "s" {
		t.Errorf("--style shorthand = %q, want %q", flag.Shorthand, "s")
	}
}
