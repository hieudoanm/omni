package split_test

import (
	"testing"

	"github.com/hieudoanm/omni/packages/cli/src/cmd/pdf/combine/split"
)

func TestNewCommand_Structure(t *testing.T) {
	cmd := split.NewCommand()
	if cmd.Use != "split <file>" {
		t.Errorf("Use = %q, want %q", cmd.Use, "split <file>")
	}
}

func TestNewCommand_HasFlags(t *testing.T) {
	cmd := split.NewCommand()
	if cmd.Flag("pages") == nil {
		t.Error("missing --pages flag")
	}
	if cmd.Flag("output") == nil {
		t.Error("missing --output flag")
	}
}
