package reaction

import (
	"testing"
)

func TestNewCommand(t *testing.T) {
	cmd := NewCommand()
	if cmd.Use != "reaction" {
		t.Errorf("NewCommand().Use = %q, want %q", cmd.Use, "reaction")
	}
	if cmd.Short == "" {
		t.Error("NewCommand().Short should not be empty")
	}
}
