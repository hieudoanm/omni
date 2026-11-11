package battery

import (
	"testing"
)

func TestNewCmd(t *testing.T) {
	cmd := NewCmd()
	if cmd.Use != "battery" {
		t.Errorf("Use = %q", cmd.Use)
	}
	if cmd.Short != "Show battery status" {
		t.Errorf("Short = %q", cmd.Short)
	}
	wantLong := "Display battery percentage, charging state, and time remaining."
	if cmd.Long != wantLong {
		t.Errorf("Long = %q, want %q", cmd.Long, wantLong)
	}
	wantExample := "  system battery\n  system battery --json"
	if cmd.Example != wantExample {
		t.Errorf("Example = %q, want %q", cmd.Example, wantExample)
	}
	if cmd.Flag("json") == nil {
		t.Error("expected --json flag")
	}
}
