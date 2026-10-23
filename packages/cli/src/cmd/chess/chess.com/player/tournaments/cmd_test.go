package tournaments

import (
	"testing"
)

func TestNewCmd_Use(t *testing.T) {
	cmd := NewCmd()
	if cmd.Use != "tournaments" {
		t.Errorf("expected Use 'tournaments', got %q", cmd.Use)
	}
}
