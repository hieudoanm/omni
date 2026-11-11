package count

import "testing"

func TestNewCmd(t *testing.T) {
	cmd := NewCmd()
	if cmd.Use != "count" {
		t.Errorf("Use = %q, want %q", cmd.Use, "count")
	}
}

func TestNewCmdHasFlags(t *testing.T) {
	cmd := NewCmd()
	if cmd.Flags().Lookup("cards") == nil {
		t.Error("expected --cards flag")
	}
}
