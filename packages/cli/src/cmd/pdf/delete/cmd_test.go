package delete_test

import (
	"testing"

	"github.com/hieudoanm/omni/packages/cli/src/cmd/pdf/delete"
)

func TestNewCommand_Structure(t *testing.T) {
	cmd := delete.NewCommand()
	if cmd.Use != "delete <file>" {
		t.Errorf("Use = %q, want %q", cmd.Use, "delete <file>")
	}
}

func TestNewCommand_HasFlags(t *testing.T) {
	cmd := delete.NewCommand()
	if cmd.Flag("pages") == nil {
		t.Error("missing --pages flag")
	}
	if cmd.Flag("output") == nil {
		t.Error("missing --output flag")
	}
}
