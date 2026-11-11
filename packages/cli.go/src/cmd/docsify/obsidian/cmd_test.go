package obsidian

import (
	"testing"
)

func TestNewCmd(t *testing.T) {
	cmd := NewCmd()
	if cmd.Use != "obsidian" {
		t.Errorf("Use = %q, want %q", cmd.Use, "obsidian")
	}
	if cmd.Short != "Build a wiki-link graph from markdown files" {
		t.Errorf("Short = %q, want %q", cmd.Short, "Build a wiki-link graph from markdown files")
	}
	if cmd.Example == "" {
		t.Error("Example should not be empty")
	}
	if cmd.RunE == nil {
		t.Error("RunE should not be nil")
	}
	for _, name := range []string{"dir", "out", "format", "exclude"} {
		if cmd.Flags().Lookup(name) == nil {
			t.Errorf("expected --%s flag", name)
		}
	}
}
