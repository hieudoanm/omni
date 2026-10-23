package create_test

import (
	"testing"

	"github.com/hieudoanm/omni/packages/cli/src/cmd/pdf/create"
)

func TestNewCommand_Structure(t *testing.T) {
	cmd := create.NewCommand()
	if cmd.Use != "create" {
		t.Errorf("Use = %q, want %q", cmd.Use, "create")
	}
}

func TestNewCommand_HasFlags(t *testing.T) {
	cmd := create.NewCommand()
	if cmd.Flag("text") == nil {
		t.Error("missing --text flag")
	}
	if cmd.Flag("file") == nil {
		t.Error("missing --file flag")
	}
	if cmd.Flag("output") == nil {
		t.Error("missing --output flag")
	}
}
