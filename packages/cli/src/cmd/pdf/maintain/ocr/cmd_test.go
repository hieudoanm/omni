package ocr_test

import (
	"testing"

	"github.com/hieudoanm/omni/packages/cli/src/cmd/pdf/maintain/ocr"
)

func TestNewCommand_Structure(t *testing.T) {
	cmd := ocr.NewCommand()
	if cmd.Use != "ocr <file>" {
		t.Errorf("Use = %q, want %q", cmd.Use, "ocr <file>")
	}
}

func TestNewCommand_HasFlags(t *testing.T) {
	cmd := ocr.NewCommand()
	for _, flag := range []string{"language", "output"} {
		if cmd.Flag(flag) == nil {
			t.Errorf("missing --%s flag", flag)
		}
	}
}
