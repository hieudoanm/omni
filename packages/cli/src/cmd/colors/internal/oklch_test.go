package internal

import (
	"testing"
)

func TestOKLCHIsValid(t *testing.T) {
	tests := []struct {
		oklch OKLCH
		valid bool
	}{
		{OKLCH{0.5, 0.1, 180}, true},
		{OKLCH{1, 0, 360}, true},
		{OKLCH{0, 0, 0}, true},
		{OKLCH{-0.1, 0, 0}, false},
		{OKLCH{1.1, 0, 0}, false},
		{OKLCH{0.5, -0.1, 0}, false},
		{OKLCH{0.5, 0.1, -1}, false},
		{OKLCH{0.5, 0.1, 361}, false},
	}
	for _, tt := range tests {
		got := tt.oklch.IsValid()
		if got != tt.valid {
			t.Errorf("OKLCH%+v.IsValid() = %v, want %v", tt.oklch, got, tt.valid)
		}
	}
}

func TestOKLCHToRGB(t *testing.T) {
	tests := []struct {
		name      string
		oklch     OKLCH
		shouldErr bool
	}{
		{"valid red-ish", OKLCH{0.5, 0.1, 0}, false},
		{"valid green-ish", OKLCH{0.5, 0.1, 120}, false},
		{"valid blue-ish", OKLCH{0.5, 0.1, 240}, false},
		{"white", OKLCH{1, 0, 0}, false},
		{"black", OKLCH{0, 0, 0}, false},
		{"invalid L", OKLCH{-0.1, 0, 0}, true},
	}
	for _, tt := range tests {
		r, g, b, err := tt.oklch.ToRGB()
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

func TestOKLCHToHex(t *testing.T) {
	hex, err := OKLCH{0.5, 0.1, 180}.ToHex()
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if len(hex) != 7 || hex[0] != '#' {
		t.Errorf("unexpected hex format: %q", hex)
	}
}

func TestOKLCHToHSL(t *testing.T) {
	h, s, l, err := OKLCH{0.5, 0.1, 180}.ToHSL()
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

func TestOKLCHToHCL(t *testing.T) {
	h, c, l, err := OKLCH{0.5, 0.1, 180}.ToHCL()
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if h < 0 || h > 360 {
		t.Errorf("hue out of range: %.4f", h)
	}
	if l < 0 || l > 100 {
		t.Errorf("lightness out of range: %.4f", l)
	}
	if c < 0 {
		t.Errorf("chroma negative: %.4f", c)
	}
}

func TestOKLCHToCMYK(t *testing.T) {
	c, m, y, k, err := OKLCH{0.5, 0.1, 180}.ToCMYK()
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if c < 0 || m < 0 || y < 0 || k < 0 {
		t.Errorf("negative CMYK values: (%.4f, %.4f, %.4f, %.4f)", c, m, y, k)
	}
}

func TestOKLCHIsValidEdgeCases(t *testing.T) {
	tests := []struct {
		oklch OKLCH
		valid bool
	}{
		{OKLCH{0.5, 0.3, 180}, true},
		{OKLCH{0.5, 0.3, 360}, true},
		{OKLCH{0, 0, 0}, true},
		{OKLCH{1, 1, 360}, true},
		{OKLCH{1.0001, 0, 0}, false},
		{OKLCH{0.5, 0, -0.001}, false},
	}
	for _, tt := range tests {
		got := tt.oklch.IsValid()
		if got != tt.valid {
			t.Errorf("OKLCH%+v.IsValid() = %v, want %v", tt.oklch, got, tt.valid)
		}
	}
}

func TestOKLCHToOklab(t *testing.T) {
	L, a, b := OKLCH{0.5, 0, 0}.ToOklab()
	if L != 0.5 {
		t.Errorf("ToOklab L = %v, want 0.5", L)
	}
	if a != 0 || b != 0 {
		t.Errorf("ToOklab with C=0: got (%.4f, %.4f), want (0, 0)", a, b)
	}
}

func TestOKLCHToRGBEdgeCases(t *testing.T) {
	tests := []struct {
		name      string
		oklch     OKLCH
		shouldErr bool
	}{
		{"zero chroma", OKLCH{0.5, 0, 0}, false},
		{"max lightness", OKLCH{1, 0, 0}, false},
		{"min lightness", OKLCH{0, 0, 0}, false},
		{"invalid high L", OKLCH{2, 0, 0}, true},
		{"invalid H", OKLCH{0.5, 0.1, 400}, true},
	}
	for _, tt := range tests {
		r, g, b, err := tt.oklch.ToRGB()
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

func TestOKLCHInvalidReturnsError(t *testing.T) {
	invalid := OKLCH{2, 0, 0}
	if _, _, _, err := invalid.ToRGB(); err == nil {
		t.Error("ToRGB: expected error")
	}
	if _, err := invalid.ToHex(); err == nil {
		t.Error("ToHex: expected error")
	}
	if _, _, _, err := invalid.ToHSL(); err == nil {
		t.Error("ToHSL: expected error")
	}
	if _, _, _, err := invalid.ToHCL(); err == nil {
		t.Error("ToHCL: expected error")
	}
	if _, _, _, _, err := invalid.ToCMYK(); err == nil {
		t.Error("ToCMYK: expected error")
	}
}
