package expected

import (
	"testing"
)

func TestNewCmd(t *testing.T) {
	cmd := NewCmd()
	if cmd == nil {
		t.Fatal("NewCmd() returned nil")
	}
	if cmd.Use != "expected-score" {
		t.Errorf("Use = %q, want %q", cmd.Use, "expected-score")
	}
}
