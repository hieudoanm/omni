package tree

import (
	"testing"
)

func TestNewCmd(t *testing.T) {
	cmd := NewCmd()
	if cmd.Use != "tree" {
		t.Errorf("Use = %q, want %q", cmd.Use, "tree")
	}
	if cmd.Short != "Generate directory tree as Markdown" {
		t.Errorf("Short = %q, want %q", cmd.Short, "Generate directory tree as Markdown")
	}
	if cmd.Example == "" {
		t.Error("Example should not be empty")
	}
	if cmd.RunE == nil {
		t.Error("RunE should not be nil")
	}
	for _, name := range []string{"dir", "out", "ignore-dir", "ignore-file"} {
		if cmd.Flags().Lookup(name) == nil {
			t.Errorf("expected --%s flag", name)
		}
	}
}
