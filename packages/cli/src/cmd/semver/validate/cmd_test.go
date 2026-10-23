package validate

import (
	"testing"
)

func TestNewCmdHasFlags(t *testing.T) {
	cmd := NewCmd()
	if cmd.Use != "validate [--versions <v1,v2,...>]" {
		t.Errorf("Use = %q", cmd.Use)
	}
	_, err := cmd.Flags().GetStringSlice("versions")
	if err != nil {
		t.Error("expected --versions flag")
	}
}
