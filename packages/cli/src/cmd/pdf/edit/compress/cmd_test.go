package compress_test

import (
	"testing"

	"github.com/hieudoanm/omni/packages/cli/src/cmd/pdf/edit/compress"
)

func TestNewCommand_Structure(t *testing.T) {
	cmd := compress.NewCommand()
	if cmd.Use != "compress <file>" {
		t.Errorf("Use = %q, want %q", cmd.Use, "compress <file>")
	}
}

func TestNewCommand_HasOutputFlag(t *testing.T) {
	cmd := compress.NewCommand()
	if cmd.Flag("output") == nil {
		t.Error("missing --output flag")
	}
}
