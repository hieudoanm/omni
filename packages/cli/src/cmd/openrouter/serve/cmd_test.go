package serve

import (
	"testing"
)

func TestNewCmd(t *testing.T) {
	cmd := NewCmd()
	if cmd.Use != "serve" {
		t.Errorf("Use = %q, want %q", cmd.Use, "serve")
	}
	if cmd.Flag("port") == nil {
		t.Error("expected --port flag")
	}
}
