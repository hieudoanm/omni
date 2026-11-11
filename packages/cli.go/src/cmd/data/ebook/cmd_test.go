package ebook

import (
	"testing"
)

func TestNewCmd(t *testing.T) {
	cmd := NewCmd()
	if cmd.Use != "ebook <file>" {
		t.Errorf("Use = %q, want %q", cmd.Use, "ebook <file>")
	}
	if cmd.Flag("format") == nil {
		t.Error("expected --format flag")
	}
	if cmd.Flag("output") == nil {
		t.Error("expected --output flag")
	}
}
