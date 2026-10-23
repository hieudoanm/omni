package encrypt_test

import (
	"testing"

	"github.com/hieudoanm/omni/packages/cli/src/cmd/pdf/security/encrypt"
)

func TestNewCommand_Structure(t *testing.T) {
	cmd := encrypt.NewCommand()
	if cmd.Use != "encrypt <file>" {
		t.Errorf("Use = %q, want %q", cmd.Use, "encrypt <file>")
	}
}

func TestNewCommand_HasFlags(t *testing.T) {
	cmd := encrypt.NewCommand()
	if cmd.Flag("password") == nil {
		t.Error("missing --password flag")
	}
	if cmd.Flag("decrypt") == nil {
		t.Error("missing --decrypt flag")
	}
	if cmd.Flag("output") == nil {
		t.Error("missing --output flag")
	}
}
