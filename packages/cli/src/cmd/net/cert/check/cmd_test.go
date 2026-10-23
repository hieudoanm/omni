package check

import (
	"testing"
)

func TestNewCmd_Structure(t *testing.T) {
	cmd := NewCmd()
	if cmd.Use != "check [--host <host:port>]" {
		t.Errorf("Use = %q", cmd.Use)
	}
	if cmd.Short != "Quick certificate health check (expiry warning)" {
		t.Errorf("Short = %q", cmd.Short)
	}
	if cmd.Flag("host") == nil {
		t.Error("expected --host flag")
	}
	if cmd.Flag("json") == nil {
		t.Error("expected --json flag")
	}
}
