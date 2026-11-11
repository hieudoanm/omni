package oklch

import (
	"testing"
)

func TestCmd_Structure(t *testing.T) {
	cmd := newCmd()
	if cmd.Use != "oklch" {
		t.Errorf("Use = %q, want %q", cmd.Use, "oklch")
	}
	if cmd.Short != "Convert OKLCH values to HEX, RGB, HSL, HCL, and CMYK" {
		t.Errorf("Short = %q, want %q", cmd.Short, "Convert OKLCH values to HEX, RGB, HSL, HCL, and CMYK")
	}
	if cmd.RunE == nil {
		t.Error("RunE is nil")
	}
}
