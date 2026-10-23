package online

import (
	"testing"
)

func TestNewCmd_Use(t *testing.T) {
	cmd := NewCmd()
	if cmd.Use != "online" {
		t.Errorf("expected Use 'online', got %q", cmd.Use)
	}
}
