package rearrange_test

import (
	"testing"

	"github.com/hieudoanm/omni/packages/cli/src/cmd/pdf/rearrange"
)

func TestNewCommand_Structure(t *testing.T) {
	cmd := rearrange.NewCommand()
	if cmd.Use != "rearrange <file>" {
		t.Errorf("Use = %q, want %q", cmd.Use, "rearrange <file>")
	}
}

func TestNewCommand_HasFlags(t *testing.T) {
	cmd := rearrange.NewCommand()
	if cmd.Flag("order") == nil {
		t.Error("missing --order flag")
	}
	if cmd.Flag("output") == nil {
		t.Error("missing --output flag")
	}
}
