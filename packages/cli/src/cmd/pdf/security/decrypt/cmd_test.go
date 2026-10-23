package decrypt_test

import (
	"testing"

	"github.com/hieudoanm/omni/packages/cli/src/cmd/pdf/security/decrypt"
)

func TestNewCommand_Structure(t *testing.T) {
	cmd := decrypt.NewCommand()
	if cmd.Use != "decrypt <file>" {
		t.Errorf("Use = %q, want %q", cmd.Use, "decrypt <file>")
	}
}

func TestNewCommand_HasFlags(t *testing.T) {
	cmd := decrypt.NewCommand()
	if cmd.Flag("password") == nil {
		t.Error("missing --password flag")
	}
	if cmd.Flag("output") == nil {
		t.Error("missing --output flag")
	}
}
