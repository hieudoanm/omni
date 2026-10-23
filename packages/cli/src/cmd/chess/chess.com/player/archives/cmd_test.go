package archives

import (
	"testing"
)

func TestNewCmd_Use(t *testing.T) {
	cmd := NewCmd()
	if cmd.Use != "archives" {
		t.Errorf("expected Use 'archives', got %q", cmd.Use)
	}
}
