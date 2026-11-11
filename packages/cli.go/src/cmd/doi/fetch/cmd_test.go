package fetch

import (
	"testing"
)

func TestNewCmd(t *testing.T) {
	cmd := NewCmd()
	if cmd.Use != "fetch [doi]" {
		t.Errorf("Use = %q, want %q", cmd.Use, "fetch [doi]")
	}
	if cmd.Short != "Fetch raw metadata for a DOI" {
		t.Errorf("Short = %q", cmd.Short)
	}
	if cmd.Long == "" {
		t.Error("Long should not be empty")
	}
	if cmd.Example == "" {
		t.Error("Example should not be empty")
	}
}
