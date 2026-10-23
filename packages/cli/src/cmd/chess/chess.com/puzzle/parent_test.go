package puzzle

import (
	"testing"
)

func TestNewCmd(t *testing.T) {
	cmd := NewCmd()
	if cmd.Use != "puzzle" {
		t.Errorf("expected Use 'puzzle', got %q", cmd.Use)
	}
}
