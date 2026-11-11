package strategy

import "testing"

func TestNewCmd(t *testing.T) {
	cmd := NewCmd()
	if cmd.Use != "strategy" {
		t.Errorf("Use = %q, want %q", cmd.Use, "strategy")
	}
}

func TestNewCmdHasFlags(t *testing.T) {
	cmd := NewCmd()
	if cmd.Flags().Lookup("simulations") == nil {
		t.Error("expected --simulations flag")
	}
}
