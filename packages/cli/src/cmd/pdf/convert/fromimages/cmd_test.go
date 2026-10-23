package fromimages_test

import (
	"testing"

	"github.com/hieudoanm/omni/packages/cli/src/cmd/pdf/convert/fromimages"
)

func TestNewCommand_Structure(t *testing.T) {
	cmd := fromimages.NewCommand()
	if cmd.Use != "from-images <files...>" {
		t.Errorf("Use = %q, want %q", cmd.Use, "from-images <files...>")
	}
}

func TestNewCommand_HasOutputFlag(t *testing.T) {
	cmd := fromimages.NewCommand()
	if cmd.Flag("output") == nil {
		t.Error("missing --output flag")
	}
}

func TestNewCommand_RequiresArgs(t *testing.T) {
	cmd := fromimages.NewCommand()
	if cmd.Args == nil {
		t.Error("expected args validator")
	}
}
