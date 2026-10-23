package images_test

import (
	"testing"

	"github.com/hieudoanm/omni/packages/cli/src/cmd/pdf/extract/images"
)

func TestNewCommand_Structure(t *testing.T) {
	cmd := images.NewCommand()
	if cmd.Use != "images <file>" {
		t.Errorf("Use = %q, want %q", cmd.Use, "images <file>")
	}
}

func TestNewCommand_HasFlags(t *testing.T) {
	cmd := images.NewCommand()
	if cmd.Flag("output") == nil {
		t.Error("missing --output flag")
	}
}
