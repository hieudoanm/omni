package rotate_test

import (
	"testing"

	"github.com/hieudoanm/omni/packages/cli/src/cmd/pdf/edit/rotate"
)

func TestNewCommand_Structure(t *testing.T) {
	cmd := rotate.NewCommand()
	if cmd.Use != "rotate <file>" {
		t.Errorf("Use = %q, want %q", cmd.Use, "rotate <file>")
	}
}

func TestNewCommand_HasFlags(t *testing.T) {
	cmd := rotate.NewCommand()
	for _, flag := range []string{"angle", "pages", "output"} {
		if cmd.Flag(flag) == nil {
			t.Errorf("missing --%s flag", flag)
		}
	}
}
