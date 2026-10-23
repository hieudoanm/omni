package hex

import (
	"testing"
)

func TestCmd_Structure(t *testing.T) {
	cmd := newCmd()
	if cmd.Use != "hex" {
		t.Errorf("Use = %q, want %q", cmd.Use, "hex")
	}
	if cmd.Short != "Convert a HEX color to RGB, HSL, HCL, OKLCH, and CMYK" {
		t.Errorf("Short = %q, want %q", cmd.Short, "Convert a HEX color to RGB, HSL, HCL, OKLCH, and CMYK")
	}
	if cmd.RunE == nil {
		t.Error("RunE is nil")
	}
}
