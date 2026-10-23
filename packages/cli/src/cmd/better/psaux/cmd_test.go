package psaux

import (
	"testing"
)

func TestNewCommand(t *testing.T) {
	cmd := NewCommand()
	if cmd.Use != "psaux" {
		t.Errorf("Use = %q, want %q", cmd.Use, "psaux")
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
	for _, name := range []string{"sort", "user"} {
		if cmd.Flag(name) == nil {
			t.Errorf("expected --%s flag", name)
		}
	}
}
