package yml

import (
	"testing"
)

func TestNewCmd(t *testing.T) {
	cmd := NewCmd()
	if cmd == nil {
		t.Fatal("NewCmd() returned nil")
	}
	if cmd.Use != "yml <file>" {
		t.Errorf("Use = %q", cmd.Use)
	}
	for _, name := range []string{"validate", "lint", "json"} {
		if cmd.Flag(name) == nil {
			t.Errorf("missing flag: --%s", name)
		}
	}
}

func TestNewCmdArgs(t *testing.T) {
	cmd := NewCmd()
	if err := cmd.Args(cmd, []string{}); err != nil {
		t.Errorf("expected no error for 0 args, got: %v", err)
	}
	if err := cmd.Args(cmd, []string{"file.yml"}); err != nil {
		t.Errorf("expected no error for 1 arg, got: %v", err)
	}
	if err := cmd.Args(cmd, []string{"a", "b"}); err == nil {
		t.Error("expected error for 2 args")
	}
}

func TestNewCmdMetadata(t *testing.T) {
	cmd := NewCmd()
	if cmd.Short == "" {
		t.Error("Short description should not be empty")
	}
	if cmd.Long == "" {
		t.Error("Long description should not be empty")
	}
	if cmd.Example == "" {
		t.Error("Example should not be empty")
	}
}
