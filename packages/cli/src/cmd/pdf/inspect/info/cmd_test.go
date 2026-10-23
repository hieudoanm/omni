package info_test

import (
	"testing"

	"github.com/hieudoanm/omni/packages/cli/src/cmd/pdf/inspect/info"
)

func TestNewCommand_Structure(t *testing.T) {
	cmd := info.NewCommand()
	if cmd.Use != "info <file>" {
		t.Errorf("Use = %q, want %q", cmd.Use, "info <file>")
	}
}
