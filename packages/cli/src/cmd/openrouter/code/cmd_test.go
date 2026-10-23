package code

import (
	"testing"
)

func TestNewCmd(t *testing.T) {
	cmd := NewCmd()
	if cmd.Use != "code" {
		t.Errorf("Use = %q, want %q", cmd.Use, "code")
	}
	if cmd.Flag("model") == nil {
		t.Error("expected --model flag")
	}
}
