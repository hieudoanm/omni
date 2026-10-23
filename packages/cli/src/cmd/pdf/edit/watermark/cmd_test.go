package watermark_test

import (
	"testing"

	"github.com/hieudoanm/omni/packages/cli/src/cmd/pdf/edit/watermark"
)

func TestNewCommand_Structure(t *testing.T) {
	cmd := watermark.NewCommand()
	if cmd.Use != "watermark <file>" {
		t.Errorf("Use = %q, want %q", cmd.Use, "watermark <file>")
	}
}

func TestNewCommand_HasFlags(t *testing.T) {
	cmd := watermark.NewCommand()
	for _, flag := range []string{"text", "output", "pages", "opacity"} {
		if cmd.Flag(flag) == nil {
			t.Errorf("missing --%s flag", flag)
		}
	}
}
