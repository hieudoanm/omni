package rewrite

import (
	"testing"
)

func TestNewCmd(t *testing.T) {
	cmd := NewCmd()
	if cmd.Use != "rewrite [text]" {
		t.Errorf("Use = %q, want %q", cmd.Use, "rewrite [text]")
	}
	if cmd.Flag("file") == nil {
		t.Error("expected --file flag")
	}
	if cmd.Flag("style") == nil {
		t.Error("expected --style flag")
	}
}
