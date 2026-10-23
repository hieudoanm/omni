package cite

import (
	"testing"
)

func TestNewCmd(t *testing.T) {
	cmd := NewCmd()
	if cmd.Use != "cite [doi]" {
		t.Errorf("Use = %q, want %q", cmd.Use, "cite [doi]")
	}
	if cmd.Short != "Generate an APA citation from a DOI" {
		t.Errorf("Short = %q", cmd.Short)
	}
	if cmd.Long == "" {
		t.Error("Long should not be empty")
	}
	if cmd.Example == "" {
		t.Error("Example should not be empty")
	}
}
