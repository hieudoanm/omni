package ls

import (
	"testing"
)

func TestNewCommand(t *testing.T) {
	cmd := NewCommand()
	if cmd.Use != "ls [--dir <dir>] [--long] [--all] [--human] [--reverse] [--time] [--size]" {
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
	for _, name := range []string{"dir", "all", "long", "human", "reverse", "time", "size"} {
		if cmd.Flag(name) == nil {
			t.Errorf("expected --%s flag", name)
		}
	}
}
