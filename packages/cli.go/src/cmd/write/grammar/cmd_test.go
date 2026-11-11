package grammar

import (
	"testing"
)

func TestNewCmd(t *testing.T) {
	cmd := NewCmd()
	if cmd.Use != "grammar [text]" {
		t.Errorf("Use = %q, want %q", cmd.Use, "grammar [text]")
	}
	if cmd.Flag("file") == nil {
		t.Error("expected --file flag")
	}
}
