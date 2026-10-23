package name

import (
	"testing"
)

func TestNewCommand(t *testing.T) {
	cmd := NewCommand()
	if cmd.Use != "name" {
		t.Errorf("Use = %q, want %q", cmd.Use, "name")
	}
	if cmd.RunE == nil {
		t.Error("RunE is nil")
	}
	f := cmd.Flag("name")
	if f == nil {
		t.Fatal("missing --name flag")
	}
}
