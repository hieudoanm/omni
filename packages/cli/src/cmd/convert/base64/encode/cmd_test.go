package encode_test

import (
	"testing"

	"github.com/hieudoanm/omni/packages/cli/src/cmd/convert/base64/encode"
)

func TestNewCmd_Structure(t *testing.T) {
	cmd := encode.NewCmd()
	if cmd.Use != "encode [text]" {
		t.Errorf("Use = %q, want %q", cmd.Use, "encode [text]")
	}
	if cmd.Flag("file") == nil {
		t.Error("expected --file flag")
	}
	if cmd.Flag("output") == nil {
		t.Error("expected --output flag")
	}
}
