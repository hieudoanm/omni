package country

import (
	"testing"
)

func TestNewCmd(t *testing.T) {
	cmd := NewCmd()
	if cmd.Use != "country" {
		t.Errorf("expected Use 'country', got %q", cmd.Use)
	}
}
