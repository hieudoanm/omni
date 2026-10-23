package redact_test

import (
	"testing"

	"github.com/hieudoanm/omni/packages/cli/src/cmd/pdf/edit/redact"
)

func TestNewCommand_Structure(t *testing.T) {
	cmd := redact.NewCommand()
	if cmd.Use != "redact <file>" {
		t.Errorf("Use = %q, want %q", cmd.Use, "redact <file>")
	}
}

func TestNewCommand_HasFlags(t *testing.T) {
	cmd := redact.NewCommand()
	for _, flag := range []string{"pages", "region", "output"} {
		if cmd.Flag(flag) == nil {
			t.Errorf("missing --%s flag", flag)
		}
	}
}
