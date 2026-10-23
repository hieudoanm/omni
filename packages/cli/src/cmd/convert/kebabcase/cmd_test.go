package kebabcase_test

import (
	"testing"

	"github.com/hieudoanm/omni/packages/cli/src/cmd/convert/kebabcase"
)

func TestNewCommand_Structure(t *testing.T) {
	cmd := kebabcase.NewCommand()
	if cmd.Use != "kebabcase <text>" {
		t.Errorf("Use = %q, want %q", cmd.Use, "kebabcase <text>")
	}
}
