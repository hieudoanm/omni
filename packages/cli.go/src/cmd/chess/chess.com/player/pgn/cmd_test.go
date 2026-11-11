package pgn

import (
	"testing"
)

func TestNewCmd_Use(t *testing.T) {
	cmd := NewCmd()
	if cmd.Use != "pgn" {
		t.Errorf("expected Use 'pgn', got %q", cmd.Use)
	}
}
