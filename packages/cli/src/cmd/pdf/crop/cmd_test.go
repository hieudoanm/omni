package crop_test

import (
	"testing"

	"github.com/hieudoanm/omni/packages/cli/src/cmd/pdf/crop"
)

func TestNewCommand_Structure(t *testing.T) {
	cmd := crop.NewCommand()
	if cmd.Use != "crop <file>" {
		t.Errorf("Use = %q, want %q", cmd.Use, "crop <file>")
	}
}

func TestNewCommand_HasFlags(t *testing.T) {
	cmd := crop.NewCommand()
	if cmd.Flag("bbox") == nil {
		t.Error("missing --bbox flag")
	}
	if cmd.Flag("pages") == nil {
		t.Error("missing --pages flag")
	}
	if cmd.Flag("output") == nil {
		t.Error("missing --output flag")
	}
}
