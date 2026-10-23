package chess960

import (
	"testing"
)

func TestNewCmd(t *testing.T) {
	cmd := NewCmd()
	if cmd.Use != "chess960" {
		t.Errorf("expected Use 'chess960', got %q", cmd.Use)
	}
}
