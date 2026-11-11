package recall

import (
	"testing"
)

func TestNewCommand(t *testing.T) {
	cmd := NewCommand()
	if cmd.Use != "recall" {
		t.Errorf("NewCommand().Use = %q, want %q", cmd.Use, "recall")
	}
	if cmd.Short == "" {
		t.Error("NewCommand().Short should not be empty")
	}
}
