package live

import (
	"testing"
)

func TestNewCmd_Use(t *testing.T) {
	cmd := NewCmd()
	if cmd.Use != "live" {
		t.Errorf("expected Use 'live', got %q", cmd.Use)
	}
}
