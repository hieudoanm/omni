package scan

import (
	"testing"
)

func TestNewCmd(t *testing.T) {
	cmd := NewCmd()
	if cmd.Use != "scan" {
		t.Errorf("Use = %q, want %q", cmd.Use, "scan")
	}
	if cmd.Short != "Scan a codebase and generate a GraphML file" {
		t.Errorf("Short = %q, want %q", cmd.Short, "Scan a codebase and generate a GraphML file")
	}
	if cmd.Example == "" {
		t.Error("Example should not be empty")
	}
	if cmd.RunE == nil {
		t.Error("RunE should not be nil")
	}
	for _, name := range []string{"dir", "out", "exclude", "verbose"} {
		if cmd.Flags().Lookup(name) == nil {
			t.Errorf("expected --%s flag", name)
		}
	}
}
