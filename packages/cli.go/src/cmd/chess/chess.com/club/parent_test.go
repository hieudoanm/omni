package club

import (
	"testing"
)

func TestNewCmd(t *testing.T) {
	cmd := NewCmd()
	if cmd.Use != "club" {
		t.Errorf("expected Use 'club', got %q", cmd.Use)
	}
}
