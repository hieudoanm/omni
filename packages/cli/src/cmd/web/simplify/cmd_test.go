package simplify

import (
	"testing"

	"github.com/spf13/cobra"
)

func TestNewCmd(t *testing.T) {
	cmd := NewCmd()
	if cmd.Use != "simplify" {
		t.Errorf("Use = %q, want 'simplify'", cmd.Use)
	}
	if cmd.Short != "Extract and convert web content" {
		t.Errorf("Short = %q", cmd.Short)
	}
	expect := map[string]bool{"csv": true, "md": true, "images": true}
	got := subNameSet(cmd)
	for name := range expect {
		if !got[name] {
			t.Errorf("missing subcommand %q", name)
		}
	}
}

func subNameSet(cmd *cobra.Command) map[string]bool {
	s := make(map[string]bool)
	for _, c := range cmd.Commands() {
		s[c.Name()] = true
	}
	return s
}
