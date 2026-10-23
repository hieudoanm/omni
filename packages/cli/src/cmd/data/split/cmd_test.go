package split

import (
	"testing"
)

func TestNewCmd(t *testing.T) {
	cmd := NewCmd()
	if cmd.Use != "split <file>" {
		t.Errorf("Use = %q, want %q", cmd.Use, "split <file>")
	}
	if cmd.Flag("format") == nil {
		t.Error("expected --format flag")
	}
	if cmd.Flag("rows") == nil {
		t.Error("expected --rows flag")
	}
	if cmd.Flag("output") == nil {
		t.Error("expected --output flag")
	}
}
