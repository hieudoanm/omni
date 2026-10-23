package games

import (
	"testing"
)

func TestNewCmd_Use(t *testing.T) {
	cmd := NewCmd()
	if cmd.Use != "games" {
		t.Errorf("expected Use 'games', got %q", cmd.Use)
	}
}
