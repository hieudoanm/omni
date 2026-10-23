package gh

import (
	"testing"
)

func TestNewCommand(t *testing.T) {
	cmd := NewCommand()
	if cmd.Use != "gh" {
		t.Errorf("expected Use 'gh', got %q", cmd.Use)
	}

	expected := []string{"coc", "ignore", "languages", "license", "og"}
	for _, name := range expected {
		sub, _, err := cmd.Find([]string{name})
		if err != nil {
			t.Errorf("expected subcommand %q, got error: %v", name, err)
		}
		if sub.Name() != name {
			t.Errorf("expected subcommand Name %q, got %q", name, sub.Name())
		}
	}

	if len(cmd.Commands()) != len(expected) {
		t.Errorf("expected %d subcommands, got %d", len(expected), len(cmd.Commands()))
	}

	if f := cmd.PersistentFlags().Lookup("json"); f == nil {
		t.Error("expected persistent --json flag")
	} else if f.DefValue != "false" {
		t.Errorf("--json default = %q, want 'false'", f.DefValue)
	}
}
