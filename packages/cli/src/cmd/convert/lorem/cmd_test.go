package lorem_test

import (
	"testing"

	"github.com/hieudoanm/omni/packages/cli/src/cmd/convert/lorem"
)

func TestNewCommand_Structure(t *testing.T) {
	cmd := lorem.NewCommand()
	if cmd.Use != "lorem" {
		t.Errorf("Use = %q, want %q", cmd.Use, "lorem")
	}
}

func TestNewCommand_HasFlags(t *testing.T) {
	cmd := lorem.NewCommand()
	if cmd.Flag("paragraphs") == nil {
		t.Error("missing --paragraphs flag")
	}
	if cmd.Flag("words") == nil {
		t.Error("missing --words flag")
	}
}
