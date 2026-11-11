package matches

import (
	"testing"
)

func TestNewCmd_Use(t *testing.T) {
	cmd := NewCmd()
	if cmd.Use != "matches" {
		t.Errorf("expected Use 'matches', got %q", cmd.Use)
	}
}
