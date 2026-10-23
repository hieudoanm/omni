package random

import (
	"testing"
)

func TestNewCmd_Use(t *testing.T) {
	cmd := NewCmd()
	if cmd.Use != "random" {
		t.Errorf("expected Use 'random', got %q", cmd.Use)
	}
}
