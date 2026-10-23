package find

import (
	"testing"
)

func TestNewCmd(t *testing.T) {
	cmd := NewCmd()
	if cmd == nil {
		t.Fatal("NewCmd() returned nil")
	}
	if cmd.Use != "find" {
		t.Errorf("Use = %q", cmd.Use)
	}
	if cmd.Flag("start") == nil || cmd.Flag("end") == nil {
		t.Error("expected --start and --end flags")
	}
}

func TestFindCmd_RunE_InvalidRange(t *testing.T) {
	cmd := NewCmd()
	cmd.Flags().Set("start", "9000")
	cmd.Flags().Set("end", "8000")

	err := cmd.RunE(cmd, []string{})
	if err == nil {
		t.Fatal("expected error for start > end range")
	}
}
