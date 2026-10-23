package rgb

import (
	"testing"
)

func TestCmd_Structure(t *testing.T) {
	cmd := newCmd()
	if cmd.Use != "rgb" {
		t.Errorf("Use = %q, want %q", cmd.Use, "rgb")
	}
	if cmd.Short != "Convert RGB values to HEX, HSL, HCL, OKLCH, and CMYK" {
		t.Errorf("Short = %q, want %q", cmd.Short, "Convert RGB values to HEX, HSL, HCL, OKLCH, and CMYK")
	}
	if cmd.RunE == nil {
		t.Error("RunE is nil")
	}
}
