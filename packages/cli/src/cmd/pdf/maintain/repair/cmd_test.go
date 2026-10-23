package repair_test

import (
	"testing"

	"github.com/hieudoanm/omni/packages/cli/src/cmd/pdf/maintain/repair"
)

func TestNewCommand_Structure(t *testing.T) {
	cmd := repair.NewCommand()
	if cmd.Use != "repair <file>" {
		t.Errorf("Use = %q, want %q", cmd.Use, "repair <file>")
	}
}

func TestNewCommand_HasOutputFlag(t *testing.T) {
	cmd := repair.NewCommand()
	if cmd.Flag("output") == nil {
		t.Error("missing --output flag")
	}
}
