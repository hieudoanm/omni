package morse_test

import (
	"testing"

	"github.com/hieudoanm/omni/packages/cli/src/cmd/convert/morse"
)

func TestNewCommand_Structure(t *testing.T) {
	cmd := morse.NewCommand()
	if cmd.Use != "morse <text>" {
		t.Errorf("Use = %q, want %q", cmd.Use, "morse <text>")
	}
}
