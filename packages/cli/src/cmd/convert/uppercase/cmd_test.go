package uppercase_test

import (
	"testing"

	"github.com/hieudoanm/omni/packages/cli/src/cmd/convert/uppercase"
)

func TestNewCommand_Structure(t *testing.T) {
	cmd := uppercase.NewCommand()
	if cmd.Use != "uppercase <text>" {
		t.Errorf("Use = %q, want %q", cmd.Use, "uppercase <text>")
	}
}
