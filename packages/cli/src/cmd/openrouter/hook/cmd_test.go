package hook

import (
	"testing"
)

func TestNewCmd(t *testing.T) {
	cmd := NewCmd()
	if cmd.Use != "hook" {
		t.Errorf("Use = %q, want %q", cmd.Use, "hook")
	}
	if cmd.Short == "" {
		t.Error("Short should not be empty")
	}
	if cmd.Long == "" {
		t.Error("Long should not be empty")
	}
}
