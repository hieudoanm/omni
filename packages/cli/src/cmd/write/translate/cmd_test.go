package translate

import (
	"testing"
)

func TestNewCmd(t *testing.T) {
	cmd := NewCmd()
	if cmd.Use != "translate [text]" {
		t.Errorf("Use = %q, want %q", cmd.Use, "translate [text]")
	}
	if cmd.Flag("file") == nil {
		t.Error("expected --file flag")
	}
	if cmd.Flag("target") == nil {
		t.Error("expected --target flag")
	}
}
