package status

import (
	"testing"
)

func TestNewCmd(t *testing.T) {
	cmd := NewCmd()
	if cmd.Use != "status" {
		t.Errorf("Use = %q, want %q", cmd.Use, "status")
	}
	if cmd.Flag("search") == nil {
		t.Error("expected --search flag")
	}
	if cmd.Flag("workers") == nil {
		t.Error("expected --workers flag")
	}
}
