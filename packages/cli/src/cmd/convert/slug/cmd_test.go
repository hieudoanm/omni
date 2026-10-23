package slug_test

import (
	"testing"

	"github.com/hieudoanm/omni/packages/cli/src/cmd/convert/slug"
)

func TestNewCommand_Structure(t *testing.T) {
	cmd := slug.NewCommand()
	if cmd.Use != "slug <text>" {
		t.Errorf("Use = %q, want %q", cmd.Use, "slug <text>")
	}
}
