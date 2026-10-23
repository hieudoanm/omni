package capitalise_test

import (
	"testing"

	"github.com/hieudoanm/omni/packages/cli/src/cmd/convert/capitalise"
)

func TestNewCommand_Structure(t *testing.T) {
	cmd := capitalise.NewCommand()
	if cmd.Use != "capitalise <text>" {
		t.Errorf("Use = %q, want %q", cmd.Use, "capitalise <text>")
	}
}
