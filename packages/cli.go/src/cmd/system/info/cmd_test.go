package info

import (
	"testing"
)

func TestNewCmd(t *testing.T) {
	cmd := NewCmd()
	if cmd.Use != "info" {
		t.Errorf("Use = %q", cmd.Use)
	}
	if cmd.Short != "Show system information" {
		t.Errorf("Short = %q", cmd.Short)
	}
	wantLong := "Display OS, architecture, CPU count, uptime, and memory."
	if cmd.Long != wantLong {
		t.Errorf("Long = %q, want %q", cmd.Long, wantLong)
	}
	wantExample := "  system info\n  system info --json"
	if cmd.Example != wantExample {
		t.Errorf("Example = %q, want %q", cmd.Example, wantExample)
	}
	if cmd.Flag("json") == nil {
		t.Error("expected --json flag")
	}
}
