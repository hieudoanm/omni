package profile

import (
	"testing"
)

func TestNewCmd_Use(t *testing.T) {
	cmd := NewCmd()
	if cmd.Use != "profile" {
		t.Errorf("expected Use 'profile', got %q", cmd.Use)
	}
}
