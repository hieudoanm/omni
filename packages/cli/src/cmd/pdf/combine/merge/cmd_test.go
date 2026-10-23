package merge_test

import (
	"testing"

	"github.com/hieudoanm/omni/packages/cli/src/cmd/pdf/combine/merge"
)

func TestNewCommand_Structure(t *testing.T) {
	cmd := merge.NewCommand()
	if cmd.Use != "merge <file1> <file2> [files...]" {
		t.Errorf("Use = %q, want %q", cmd.Use, "merge <file1> <file2> [files...]")
	}
}

func TestNewCommand_HasOutputFlag(t *testing.T) {
	cmd := merge.NewCommand()
	if cmd.Flag("output") == nil {
		t.Error("missing --output flag")
	}
}
