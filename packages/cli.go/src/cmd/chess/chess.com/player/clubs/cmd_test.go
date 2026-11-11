package clubs

import (
	"testing"
)

func TestNewCmd_Use(t *testing.T) {
	cmd := NewCmd()
	if cmd.Use != "clubs" {
		t.Errorf("expected Use 'clubs', got %q", cmd.Use)
	}
}
