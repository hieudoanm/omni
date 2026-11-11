package hcl

import (
	"testing"
)

func TestCmd_Structure(t *testing.T) {
	cmd := newCmd()
	if cmd.Use != "hcl" {
		t.Errorf("Use = %q, want %q", cmd.Use, "hcl")
	}
	if cmd.Short != "Convert HCL values to HEX, RGB, HSL, OKLCH, and CMYK" {
		t.Errorf("Short = %q, want %q", cmd.Short, "Convert HCL values to HEX, RGB, HSL, OKLCH, and CMYK")
	}
	if cmd.RunE == nil {
		t.Error("RunE is nil")
	}
}
