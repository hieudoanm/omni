package sort

import (
	"testing"
)

func TestNewCmdHasFlags(t *testing.T) {
	cmd := NewCmd()
	if cmd.Use != "sort [--versions <v1,v2,...>]" {
		t.Errorf("Use = %q", cmd.Use)
	}
	_, err := cmd.Flags().GetStringSlice("versions")
	if err != nil {
		t.Error("expected --versions flag")
	}
}
