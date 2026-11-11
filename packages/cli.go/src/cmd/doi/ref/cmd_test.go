package ref

import (
	"testing"
)

func TestNewCmd(t *testing.T) {
	cmd := NewCmd()
	if cmd.Use != "ref [doi]" {
		t.Errorf("Use = %q, want %q", cmd.Use, "ref [doi]")
	}
	if cmd.Short != "Generate a formatted reference from a DOI" {
		t.Errorf("Short = %q", cmd.Short)
	}
	if cmd.Long == "" {
		t.Error("Long should not be empty")
	}
	if cmd.Example == "" {
		t.Error("Example should not be empty")
	}
}
