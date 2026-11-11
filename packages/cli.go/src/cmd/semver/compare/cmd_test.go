package compare

import (
	"testing"
)

func TestNewCmdHasFlags(t *testing.T) {
	cmd := NewCmd()
	if cmd.Use != "compare --a <version> --b <version>" {
		t.Errorf("Use = %q", cmd.Use)
	}
	_, err := cmd.Flags().GetString("a")
	if err != nil {
		t.Error("expected --a flag")
	}
	_, err = cmd.Flags().GetString("b")
	if err != nil {
		t.Error("expected --b flag")
	}
}
