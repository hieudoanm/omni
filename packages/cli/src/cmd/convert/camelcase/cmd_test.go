package camelcase_test

import (
	"testing"

	"github.com/hieudoanm/omni/packages/cli/src/cmd/convert/camelcase"
)

func TestNewCommand_Structure(t *testing.T) {
	cmd := camelcase.NewCommand()
	if cmd.Use != "camelcase <text>" {
		t.Errorf("Use = %q, want %q", cmd.Use, "camelcase <text>")
	}
}
