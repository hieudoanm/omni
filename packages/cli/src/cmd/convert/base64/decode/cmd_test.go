package decode_test

import (
	"testing"

	"github.com/hieudoanm/omni/packages/cli/src/cmd/convert/base64/decode"
)

func TestNewCmd_Structure(t *testing.T) {
	cmd := decode.NewCmd()
	if cmd.Use != "decode [text]" {
		t.Errorf("Use = %q, want %q", cmd.Use, "decode [text]")
	}
	if cmd.Flag("file") == nil {
		t.Error("expected --file flag")
	}
	if cmd.Flag("output") == nil {
		t.Error("expected --output flag")
	}
}
