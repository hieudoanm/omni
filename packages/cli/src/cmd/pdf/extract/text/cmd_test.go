package text_test

import (
	"testing"

	"github.com/hieudoanm/omni/packages/cli/src/cmd/pdf/extract/text"
)

func TestNewCommand_Structure(t *testing.T) {
	cmd := text.NewCommand()
	if cmd.Use != "text <file>" {
		t.Errorf("Use = %q, want %q", cmd.Use, "text <file>")
	}
}
