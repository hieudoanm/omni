package scan

import (
	"testing"
)

func TestNewCmd(t *testing.T) {
	cmd := NewCmd()
	if cmd == nil {
		t.Fatal("NewCmd() returned nil")
	}
	if cmd.Use != "scan [--host <host>]" {
		t.Errorf("Use = %q", cmd.Use)
	}
	for _, name := range []string{"host", "ports", "timeout"} {
		if cmd.Flag(name) == nil {
			t.Errorf("missing flag: --%s", name)
		}
	}
}

func TestScanCmd_RunE_NoArgs(t *testing.T) {
	cmd := NewCmd()

	err := cmd.RunE(cmd, []string{})
	if err != nil {
		t.Fatalf("expected no error with no args, got: %v", err)
	}
}
