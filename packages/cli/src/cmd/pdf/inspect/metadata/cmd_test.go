package metadata_test

import (
	"testing"

	"github.com/hieudoanm/omni/packages/cli/src/cmd/pdf/inspect/metadata"
)

func TestNewCommand_Structure(t *testing.T) {
	cmd := metadata.NewCommand()
	if cmd.Use != "metadata <file>" {
		t.Errorf("Use = %q, want %q", cmd.Use, "metadata <file>")
	}
}

func TestNewCommand_HasFlags(t *testing.T) {
	cmd := metadata.NewCommand()
	for _, flag := range []string{"title", "author", "subject", "keywords"} {
		if cmd.Flag(flag) == nil {
			t.Errorf("missing --%s flag", flag)
		}
	}
}
