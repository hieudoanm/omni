package player

import (
	"testing"
)

func TestNewCmd(t *testing.T) {
	cmd := NewCmd()
	if cmd.Use != "player" {
		t.Errorf("expected Use 'player', got %q", cmd.Use)
	}
	if cmd.Short != "Chess.com player data" {
		t.Errorf("expected Short 'Chess.com player data', got %q", cmd.Short)
	}
}
