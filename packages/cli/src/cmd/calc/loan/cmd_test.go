package loan

import (
	"testing"
)

func TestNewCmd_Structure(t *testing.T) {
	cmd := NewCmd()
	if cmd.Use != "loan" {
		t.Errorf("Use = %q, want %q", cmd.Use, "loan")
	}
	if cmd.Short != "Loan amortization calculator" {
		t.Errorf("Short = %q, want %q", cmd.Short, "Loan amortization calculator")
	}
	if cmd.RunE == nil {
		t.Error("RunE must not be nil")
	}
	if f := cmd.Flags().Lookup("principal"); f == nil {
		t.Error("expected --principal flag")
	}
	if f := cmd.Flags().Lookup("rate"); f == nil {
		t.Error("expected --rate flag")
	}
	if f := cmd.Flags().Lookup("years"); f == nil {
		t.Error("expected --years flag")
	}
}
