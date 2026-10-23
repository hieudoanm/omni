package validate

import (
	"testing"
)

func TestNewCmd_Use(t *testing.T) {
	cmd := NewCmd()
	if cmd.Use != "validate <position>" {
		t.Errorf("expected Use 'validate <position>', got %q", cmd.Use)
	}
}
