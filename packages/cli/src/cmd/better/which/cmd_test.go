package which

import (
	"testing"
)

func TestNewCommand(t *testing.T) {
	cmd := NewCommand()
	if cmd.Use != "which [commands...]" {
		t.Errorf("Use = %q, want %q", cmd.Use, "which [commands...]")
	}
	if cmd.Short == "" {
		t.Error("Short should not be empty")
	}
	if cmd.Long == "" {
		t.Error("Long should not be empty")
	}
	if cmd.Example == "" {
		t.Error("Example should not be empty")
	}
	if cmd.Flag("all") == nil {
		t.Error("expected --all flag")
	}
	if cmd.Args(cmd, []string{}) == nil {
		t.Error("expected args to be required")
	}
}
