package tournament

import (
	"testing"
)

func TestNewCmd(t *testing.T) {
	cmd := NewCmd()
	if cmd.Use != "tournament" {
		t.Errorf("expected Use 'tournament', got %q", cmd.Use)
	}
}
