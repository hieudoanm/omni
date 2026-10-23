package validate

import (
	"testing"
)

func TestNewCmd(t *testing.T) {
	cmd := NewCmd()
	if cmd.Use != "validate [doi]" {
		t.Errorf("Use = %q, want %q", cmd.Use, "validate [doi]")
	}
	if cmd.Short != "Validate a DOI string format" {
		t.Errorf("Short = %q", cmd.Short)
	}
	if cmd.Long == "" {
		t.Error("Long should not be empty")
	}
	if cmd.Example == "" {
		t.Error("Example should not be empty")
	}
}
