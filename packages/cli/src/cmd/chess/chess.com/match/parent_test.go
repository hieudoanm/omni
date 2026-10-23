package match

import (
	"testing"
)

func TestNewCmd(t *testing.T) {
	cmd := NewCmd()
	if cmd.Use != "match" {
		t.Errorf("expected Use 'match', got %q", cmd.Use)
	}
}
