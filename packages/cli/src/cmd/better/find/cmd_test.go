package find

import (
	"testing"
)

func TestNewCommand(t *testing.T) {
	cmd := NewCommand()
	if cmd.Use != "find [--pattern <glob>] [--dir <dir>] [--name <substring>] [--long]" {
		t.Errorf("Use = %q", cmd.Use)
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
	for _, name := range []string{"dir", "pattern", "name", "type", "max-depth", "all", "long", "human"} {
		if cmd.Flag(name) == nil {
			t.Errorf("expected --%s flag", name)
		}
	}
}
