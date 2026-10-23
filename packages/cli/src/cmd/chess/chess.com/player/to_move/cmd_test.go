package to_move

import (
	"testing"
)

func TestNewCmd_Use(t *testing.T) {
	cmd := NewCmd()
	if cmd.Use != "to-move" {
		t.Errorf("expected Use 'to-move', got %q", cmd.Use)
	}
}
