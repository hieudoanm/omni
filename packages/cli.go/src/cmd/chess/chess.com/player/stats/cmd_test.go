package stats

import (
	"testing"
)

func TestNewCmd_Use(t *testing.T) {
	cmd := NewCmd()
	if cmd.Use != "stats" {
		t.Errorf("expected Use 'stats', got %q", cmd.Use)
	}
}
