package archive

import (
	"testing"
)

func TestNewCmd_Use(t *testing.T) {
	cmd := NewCmd()
	if cmd.Use != "archive" {
		t.Errorf("expected Use 'archive', got %q", cmd.Use)
	}
}
