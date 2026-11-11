package gcd

import (
	"testing"
)

func TestNewCmd_Structure(t *testing.T) {
	cmd := NewCmd()
	if cmd.Use != "gcd [--a <a> --b <b>]" {
		t.Errorf("Use = %q, want %q", cmd.Use, "gcd [--a <a> --b <b>]")
	}
	if cmd.Short != "Greatest common divisor of two numbers" {
		t.Errorf("Short = %q, want %q", cmd.Short, "Greatest common divisor of two numbers")
	}
	if cmd.RunE == nil {
		t.Error("RunE must not be nil")
	}
	if f := cmd.Flags().Lookup("a"); f == nil {
		t.Error("expected --a flag")
	}
	if f := cmd.Flags().Lookup("b"); f == nil {
		t.Error("expected --b flag")
	}
}
