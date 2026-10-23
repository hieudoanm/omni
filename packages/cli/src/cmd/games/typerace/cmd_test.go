package typerace

import (
	"testing"
)

func TestNewCommand(t *testing.T) {
	cmd := NewCommand()
	if cmd.Use != "typerace" {
		t.Errorf("NewCommand().Use = %q, want %q", cmd.Use, "typerace")
	}
	if cmd.Short == "" {
		t.Error("NewCommand().Short should not be empty")
	}
}
