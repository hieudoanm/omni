package stats

import (
	"testing"
)

func TestNewCmd(t *testing.T) {
	cmd := NewCmd()
	if cmd.Use != "stats" {
		t.Errorf("Use = %q", cmd.Use)
	}
	if cmd.Short != "Show disk partition statistics" {
		t.Errorf("Short = %q", cmd.Short)
	}
	wantLong := "Display file system disk space statistics including total, used, and available space for each partition."
	if cmd.Long != wantLong {
		t.Errorf("Long = %q, want %q", cmd.Long, wantLong)
	}
	wantExample := "  system disk stats\n  system disk stats --all"
	if cmd.Example != wantExample {
		t.Errorf("Example = %q, want %q", cmd.Example, wantExample)
	}
	if cmd.Flag("all") == nil {
		t.Error("expected --all flag")
	}
}
