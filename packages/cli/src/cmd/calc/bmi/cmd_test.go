package bmi

import (
	"testing"
)

func TestNewCmd_Structure(t *testing.T) {
	cmd := NewCmd()
	if cmd.Use != "bmi" {
		t.Errorf("Use = %q, want %q", cmd.Use, "bmi")
	}
	if cmd.Short != "Calculate Body Mass Index" {
		t.Errorf("Short = %q, want %q", cmd.Short, "Calculate Body Mass Index")
	}
	if f := cmd.Flags().Lookup("weight"); f == nil {
		t.Error("expected --weight flag")
	}
	if f := cmd.Flags().Lookup("height"); f == nil {
		t.Error("expected --height flag")
	}
}
