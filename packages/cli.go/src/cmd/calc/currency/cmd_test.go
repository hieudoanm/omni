package currency

import (
	"testing"
)

func TestNewCmd_Structure(t *testing.T) {
	cmd := NewCmd()
	if cmd.Use != "currency" {
		t.Errorf("Use = %q, want %q", cmd.Use, "currency")
	}
	if cmd.Short != "Convert between currencies using Frankfurter API" {
		t.Errorf("Short = %q, want %q", cmd.Short, "Convert between currencies using Frankfurter API")
	}
	if cmd.RunE == nil {
		t.Error("RunE must not be nil")
	}
	if len(cmd.Aliases) != 2 || cmd.Aliases[0] != "cc" || cmd.Aliases[1] != "fx" {
		t.Errorf("Aliases = %v, want [cc fx]", cmd.Aliases)
	}
	if f := cmd.Flags().Lookup("from"); f == nil {
		t.Error("expected --from flag")
	}
	if f := cmd.Flags().Lookup("to"); f == nil {
		t.Error("expected --to flag")
	}
	if f := cmd.Flags().Lookup("amount"); f == nil {
		t.Error("expected --amount flag")
	}
}
