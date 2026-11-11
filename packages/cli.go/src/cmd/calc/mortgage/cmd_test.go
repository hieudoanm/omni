package mortgage

import (
	"testing"
)

func TestNewCmd_Structure(t *testing.T) {
	cmd := NewCmd()
	if cmd.Use != "mortgage" {
		t.Errorf("Use = %q, want %q", cmd.Use, "mortgage")
	}
	if cmd.Short != "Mortgage payment calculator" {
		t.Errorf("Short = %q, want %q", cmd.Short, "Mortgage payment calculator")
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
	if f := cmd.Flags().Lookup("taxes"); f == nil {
		t.Error("expected --taxes flag")
	}
	if f := cmd.Flags().Lookup("insurance"); f == nil {
		t.Error("expected --insurance flag")
	}
	if f := cmd.Flags().Lookup("pmi"); f == nil {
		t.Error("expected --pmi flag")
	}
}
