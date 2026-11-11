package youtube

import (
	"testing"

	"github.com/spf13/cobra"
)

func TestNewCmd(t *testing.T) {
	cmd := NewCmd()
	if cmd.Use != "youtube" {
		t.Errorf("Use = %q, want 'youtube'", cmd.Use)
	}
	if cmd.Short != "YouTube transcript and thumbnail tools" {
		t.Errorf("Short = %q", cmd.Short)
	}
	expect := map[string]bool{"fetch": true, "thumbnails": true}
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
