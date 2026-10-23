package toimages_test

import (
	"testing"

	"github.com/hieudoanm/omni/packages/cli/src/cmd/pdf/convert/toimages"
)

func TestNewCommand_Structure(t *testing.T) {
	cmd := toimages.NewCommand()
	if cmd.Use != "to-images <file>" {
		t.Errorf("Use = %q, want %q", cmd.Use, "to-images <file>")
	}
}

func TestNewCommand_HasFlags(t *testing.T) {
	cmd := toimages.NewCommand()
	if cmd.Flag("format") == nil {
		t.Error("missing --format flag")
	}
	if cmd.Flag("dpi") == nil {
		t.Error("missing --dpi flag")
	}
	if cmd.Flag("output") == nil {
		t.Error("missing --output flag")
	}
}
