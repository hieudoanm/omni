package prime

import (
	"testing"
)

func TestNewCmd_Structure(t *testing.T) {
	cmd := NewCmd()
	if cmd.Use != "prime [--number <n>]" {
		t.Errorf("Use = %q, want %q", cmd.Use, "prime [--number <n>]")
	}
	if cmd.Short != "Check if a number is prime, or generate primes up to N" {
		t.Errorf("Short = %q, want %q", cmd.Short, "Check if a number is prime, or generate primes up to N")
	}
	if cmd.RunE == nil {
		t.Error("RunE must not be nil")
	}
	if f := cmd.Flags().Lookup("number"); f == nil {
		t.Error("expected --number flag")
	}
	if f := cmd.Flags().Lookup("list"); f == nil {
		t.Error("expected --list flag")
	}
}
