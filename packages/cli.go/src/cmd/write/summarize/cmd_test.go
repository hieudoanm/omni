package summarize

import (
	"testing"
)

func TestNewCmd(t *testing.T) {
	cmd := NewCmd()
	if cmd.Use != "summarize [text]" {
		t.Errorf("Use = %q, want %q", cmd.Use, "summarize [text]")
	}
	if cmd.Flag("file") == nil {
		t.Error("expected --file flag")
	}
	if cmd.Flag("max-length") == nil {
		t.Error("expected --max-length flag")
	}
}
