package odds

import "testing"

func TestNewCmd(t *testing.T) {
	cmd := NewCmd()
	if cmd.Use != "odds [--hand <hole>]" {
		t.Errorf("Use = %q, want %q", cmd.Use, "odds [--hand <hole>]")
	}
}

func TestNewCmdHasFlags(t *testing.T) {
	cmd := NewCmd()
	for _, name := range []string{"hand", "board", "opponents", "simulations"} {
		if cmd.Flags().Lookup(name) == nil {
			t.Errorf("expected --%s flag", name)
		}
	}
}
