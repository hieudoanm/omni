package cron

import (
	"testing"
)

func TestNewCmd_Structure(t *testing.T) {
	cmd := NewCmd()
	if cmd.Use != "cron [--expression <expression>]" {
		t.Errorf("expected Use 'cron [--expression <expression>]', got %q", cmd.Use)
	}
	if cmd.Flag("expression") == nil {
		t.Error("expected --expression flag")
	}
	if cmd.Flag("next") == nil {
		t.Error("expected --next flag")
	}
	if cmd.Flag("until") == nil {
		t.Error("expected --until flag")
	}
	if cmd.Flag("json") == nil {
		t.Error("expected --json flag")
	}
}
