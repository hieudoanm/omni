package addnumbers_test

import (
	"testing"

	"github.com/hieudoanm/omni/packages/cli/src/cmd/pdf/addnumbers"
)

func TestNewCommand_Structure(t *testing.T) {
	cmd := addnumbers.NewCommand()
	if cmd.Use != "add-numbers <file>" {
		t.Errorf("Use = %q, want %q", cmd.Use, "add-numbers <file>")
	}
}

func TestNewCommand_HasFlags(t *testing.T) {
	cmd := addnumbers.NewCommand()
	if cmd.Flag("format") == nil {
		t.Error("missing --format flag")
	}
	if cmd.Flag("start") == nil {
		t.Error("missing --start flag")
	}
	if cmd.Flag("position") == nil {
		t.Error("missing --position flag")
	}
	if cmd.Flag("output") == nil {
		t.Error("missing --output flag")
	}
}
