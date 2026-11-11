package grayscale

import (
	"testing"
)

func TestNewCmd(t *testing.T) {
	cmd := NewCmd()
	if cmd.Use != "grayscale <file>" {
		t.Errorf("Use = %q, want %q", cmd.Use, "grayscale <file>")
	}
	if cmd.Args == nil {
		t.Fatal("expected Args validator")
	}
	flag := cmd.Flags().Lookup("output")
	if flag == nil {
		t.Fatal("expected --output flag")
	}
}
