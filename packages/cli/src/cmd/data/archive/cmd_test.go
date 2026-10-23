package archive

import "testing"

func TestNewCmd(t *testing.T) {
	cmd := NewCmd()
	if cmd.Use != "archive [files...]" {
		t.Errorf("Use = %q, want %q", cmd.Use, "archive [files...]")
	}
	if cmd.Flag("action") == nil {
		t.Error("expected --action flag")
	}
	if cmd.Flag("output") == nil {
		t.Error("expected --output flag")
	}
}
