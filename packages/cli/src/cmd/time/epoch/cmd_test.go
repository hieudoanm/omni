package epoch

import (
	"testing"
)

func TestNewCmd_Structure(t *testing.T) {
	cmd := NewCmd()
	if cmd.Use != "epoch [timestamp]" {
		t.Errorf("expected Use 'epoch [timestamp]', got %q", cmd.Use)
	}
	if cmd.Short != "Convert between epoch timestamps and human-readable dates" {
		t.Errorf("expected Short 'Convert between epoch timestamps and human-readable dates', got %q", cmd.Short)
	}
	if cmd.Flag("from") == nil {
		t.Error("expected --from flag")
	}
	if cmd.Flag("relative") == nil {
		t.Error("expected --relative flag")
	}
	if cmd.Flag("format") == nil {
		t.Error("expected --format flag")
	}
	if cmd.Flag("iso") == nil {
		t.Error("expected --iso flag")
	}
	if cmd.Flag("unix") == nil {
		t.Error("expected --unix flag")
	}
	if cmd.Flag("json") == nil {
		t.Error("expected --json flag")
	}
}
