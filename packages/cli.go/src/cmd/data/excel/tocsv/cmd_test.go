package tocsv

import (
	"testing"
)

func TestNewCmd(t *testing.T) {
	cmd := NewCmd()
	if cmd.Use != "to-csv <file>" {
		t.Errorf("Use = %q, want %q", cmd.Use, "to-csv <file>")
	}
	if cmd.Flag("output") == nil {
		t.Error("expected --output flag")
	}
}
