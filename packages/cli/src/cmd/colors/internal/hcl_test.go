package internal

import (
	"testing"
)

func TestHCLIsValid(t *testing.T) {
	tests := []struct {
		hcl   HCL
		valid bool
	}{
		{HCL{0, 50, 50}, true},
		{HCL{180, 30, 75}, true},
		{HCL{360, 0, 100}, true},
		{HCL{-1, 50, 50}, false},
		{HCL{0, 50, -1}, false},
		{HCL{0, 50, 101}, false},
		{HCL{0, -1, 50}, false},
	}
	for _, tt := range tests {
		got := tt.hcl.IsValid()
		if got != tt.valid {
			t.Errorf("HCL%+v.IsValid() = %v, want %v", tt.hcl, got, tt.valid)
		}
	}
}

func TestHCLToRGB(t *testing.T) {
	tests := []struct {
		name      string
		hcl       HCL
		r, g, b   int
		shouldErr bool
	}{
		{"invalid", HCL{-1, 0, 0}, 0, 0, 0, true},
	}
	for _, tt := range tests {
		r, g, b, err := tt.hcl.ToRGB()
		if tt.shouldErr {
			if err == nil {
				t.Errorf("%s: expected error", tt.name)
			}
			continue
		}
		if err != nil {
			t.Errorf("%s: unexpected error: %v", tt.name, err)
			continue
		}
		if r < 0 || r > 255 || g < 0 || g > 255 || b < 0 || b > 255 {
			t.Errorf("%s: RGB values out of range: (%d,%d,%d)", tt.name, r, g, b)
		}
	}
}

func TestHCLToHex(t *testing.T) {
	hex, err := HCL{0, 50, 50}.ToHex()
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if len(hex) != 7 || hex[0] != '#' {
		t.Errorf("unexpected hex format: %q", hex)
	}
}

func TestHCLToHSL(t *testing.T) {
	h, s, l, err := HCL{0, 50, 50}.ToHSL()
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if h < 0 || h > 360 {
		t.Errorf("hue out of range: %.4f", h)
	}
	if s < 0 || s > 100 {
		t.Errorf("saturation out of range: %.4f", s)
	}
	if l < 0 || l > 100 {
		t.Errorf("lightness out of range: %.4f", l)
	}
}

func TestHCLToCMYK(t *testing.T) {
	c, m, y, k, err := HCL{0, 50, 50}.ToCMYK()
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if c < 0 || m < 0 || y < 0 || k < 0 {
		t.Errorf("negative CMYK values: (%.4f, %.4f, %.4f, %.4f)", c, m, y, k)
	}
}

func TestHCLToOKLCH(t *testing.T) {
	L, C, H, err := HCL{0, 50, 50}.ToOKLCH()
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if L <= 0 || L > 1 {
		t.Errorf("L out of range: %.4f", L)
	}
	if C < 0 {
		t.Errorf("C negative: %.4f", C)
	}
	if H < 0 || H > 360 {
		t.Errorf("H out of range: %.4f", H)
	}
}

func TestHCLIsValidEdgeCases(t *testing.T) {
	tests := []struct {
		hcl   HCL
		valid bool
	}{
		{HCL{0, 0, 0}, true},
		{HCL{360, 100, 100}, true},
		{HCL{180, 0.5, 50}, true},
		{HCL{0, 0, 100}, true},
		{HCL{361, 0, 0}, false},
		{HCL{0, 0, 101}, false},
		{HCL{0, -0.1, 50}, false},
	}
	for _, tt := range tests {
		got := tt.hcl.IsValid()
		if got != tt.valid {
			t.Errorf("HCL%+v.IsValid() = %v, want %v", tt.hcl, got, tt.valid)
		}
	}
}

func TestHCLToLab(t *testing.T) {
	l, a, b := HCL{0, 0, 50}.ToLab()
	if l != 50 {
		t.Errorf("ToLab l = %v, want 50", l)
	}
	if a != 0 || b != 0 {
		t.Errorf("ToLab with C=0: got (%.4f, %.4f), want (0, 0)", a, b)
	}
}

func TestHCLToRGBEdgeCases(t *testing.T) {
	tests := []struct {
		name      string
		hcl       HCL
		shouldErr bool
	}{
		{"zero values", HCL{0, 0, 0}, false},
		{"max lightness", HCL{0, 0, 100}, false},
		{"full chroma", HCL{180, 100, 50}, false},
		{"hue 360", HCL{360, 0, 50}, false},
	}
	for _, tt := range tests {
		r, g, b, err := tt.hcl.ToRGB()
		if tt.shouldErr {
			if err == nil {
				t.Errorf("%s: expected error", tt.name)
			}
			continue
		}
		if err != nil {
			t.Errorf("%s: unexpected error: %v", tt.name, err)
			continue
		}
		if r < 0 || r > 255 || g < 0 || g > 255 || b < 0 || b > 255 {
			t.Errorf("%s: out of range: (%d,%d,%d)", tt.name, r, g, b)
		}
	}
}

func TestHCLInvalidReturnsError(t *testing.T) {
	invalid := HCL{-1, 0, 0}
	if _, _, _, err := invalid.ToRGB(); err == nil {
		t.Error("ToRGB: expected error")
	}
	if _, err := invalid.ToHex(); err == nil {
		t.Error("ToHex: expected error")
	}
	if _, _, _, err := invalid.ToHSL(); err == nil {
		t.Error("ToHSL: expected error")
	}
	if _, _, _, _, err := invalid.ToCMYK(); err == nil {
		t.Error("ToCMYK: expected error")
	}
	if _, _, _, err := invalid.ToOKLCH(); err == nil {
		t.Error("ToOKLCH: expected error")
	}
}
