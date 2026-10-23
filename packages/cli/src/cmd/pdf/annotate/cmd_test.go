package annotate_test

import (
	"testing"

	"github.com/hieudoanm/omni/packages/cli/src/cmd/pdf/annotate"
)

func TestNewCommand_Structure(t *testing.T) {
	cmd := annotate.NewCommand()
	if cmd.Use != "annotate <file>" {
		t.Errorf("Use = %q, want %q", cmd.Use, "annotate <file>")
	}
}

func TestNewCommand_HasFlags(t *testing.T) {
	cmd := annotate.NewCommand()
	if cmd.Flag("text") == nil {
		t.Error("missing --text flag")
	}
	if cmd.Flag("page") == nil {
		t.Error("missing --page flag")
	}
	if cmd.Flag("x") == nil {
		t.Error("missing --x flag")
	}
	if cmd.Flag("y") == nil {
		t.Error("missing --y flag")
	}
	if cmd.Flag("output") == nil {
		t.Error("missing --output flag")
	}
}
