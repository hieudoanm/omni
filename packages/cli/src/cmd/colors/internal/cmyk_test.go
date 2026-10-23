package internal

import (
	"testing"
)

func TestCMYKIsValid(t *testing.T) {
	tests := []struct {
		cmyk  CMYK
		valid bool
	}{
		{CMYK{0, 0, 0, 0}, true},
		{CMYK{100, 100, 100, 100}, true},
		{CMYK{50, 50, 50, 50}, true},
		{CMYK{-1, 0, 0, 0}, false},
		{CMYK{0, 101, 0, 0}, false},
		{CMYK{0, 0, 0, 101}, false},
	}
	for _, tt := range tests {
		got := tt.cmyk.IsValid()
		if got != tt.valid {
			t.Errorf("CMYK%+v.IsValid() = %v, want %v", tt.cmyk, got, tt.valid)
		}
	}
}

func TestCMYKToRGB(t *testing.T) {
	tests := []struct {
		name      string
		cmyk      CMYK
		r, g, b   int
		shouldErr bool
	}{
		{"red", CMYK{0, 100, 100, 0}, 255, 0, 0, false},
		{"green", CMYK{100, 0, 100, 0}, 0, 255, 0, false},
		{"blue", CMYK{100, 100, 0, 0}, 0, 0, 255, false},
		{"black", CMYK{0, 0, 0, 100}, 0, 0, 0, false},
		{"white", CMYK{0, 0, 0, 0}, 255, 255, 255, false},
		{"invalid", CMYK{-1, 0, 0, 0}, 0, 0, 0, true},
	}
	for _, tt := range tests {
		r, g, b, err := tt.cmyk.ToRGB()
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
		if r != tt.r || g != tt.g || b != tt.b {
			t.Errorf("%s: got (%d,%d,%d), want (%d,%d,%d)", tt.name, r, g, b, tt.r, tt.g, tt.b)
		}
	}
}

func TestCMYKToHex(t *testing.T) {
	hex, err := CMYK{0, 100, 100, 0}.ToHex()
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if hex != "#FF0000" {
		t.Errorf("ToHex() = %q, want #FF0000", hex)
	}
}

func TestCMYKToHSL(t *testing.T) {
	h, s, l, err := CMYK{0, 100, 100, 0}.ToHSL()
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if !approxEq(h, 0, 0.01) || !approxEq(s, 100, 0.01) || !approxEq(l, 50, 0.01) {
		t.Errorf("ToHSL() = (%.4f, %.4f, %.4f), want (0, 100, 50)", h, s, l)
	}
}

func TestCMYKToHCL(t *testing.T) {
	h, cVal, l, err := CMYK{0, 100, 100, 0}.ToHCL()
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if h < 0 || h > 360 {
		t.Errorf("hue out of range: %.4f", h)
	}
	if cVal < 0 {
		t.Errorf("chroma negative: %.4f", cVal)
	}
	if l <= 0 || l > 100 {
		t.Errorf("lightness out of range: %.4f", l)
	}
}

func TestCMYKToOKLCH(t *testing.T) {
	L, C, H, err := CMYK{0, 100, 100, 0}.ToOKLCH()
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

func TestCMYKIsValidEdgeCases(t *testing.T) {
	tests := []struct {
		cmyk  CMYK
		valid bool
	}{
		{CMYK{0.5, 0.5, 0.5, 0.5}, true},
		{CMYK{100, 0, 0, 0}, true},
		{CMYK{0, 100, 0, 0}, true},
		{CMYK{0, 0, 100, 0}, true},
		{CMYK{50.5, 50.5, 50.5, 50.5}, true},
		{CMYK{100.1, 0, 0, 0}, false},
		{CMYK{0, -0.1, 0, 0}, false},
	}
	for _, tt := range tests {
		got := tt.cmyk.IsValid()
		if got != tt.valid {
			t.Errorf("CMYK%+v.IsValid() = %v, want %v", tt.cmyk, got, tt.valid)
		}
	}
}

func TestCMYKToRGBEdgeCases(t *testing.T) {
	tests := []struct {
		name      string
		cmyk      CMYK
		r, g, b   int
		shouldErr bool
	}{
		{"cyan", CMYK{100, 0, 0, 0}, 0, 255, 255, false},
		{"magenta", CMYK{0, 100, 0, 0}, 255, 0, 255, false},
		{"yellow", CMYK{0, 0, 100, 0}, 255, 255, 0, false},
		{"invalid C", CMYK{150, 0, 0, 0}, 0, 0, 0, true},
		{"invalid M", CMYK{0, -5, 0, 0}, 0, 0, 0, true},
	}
	for _, tt := range tests {
		r, g, b, err := tt.cmyk.ToRGB()
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
		if r != tt.r || g != tt.g || b != tt.b {
			t.Errorf("%s: got (%d,%d,%d), want (%d,%d,%d)", tt.name, r, g, b, tt.r, tt.g, tt.b)
		}
	}
}

func TestCMYKInvalidReturnsError(t *testing.T) {
	invalid := CMYK{-1, 0, 0, 0}
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
	if _, _, _, err := invalid.ToOKLCH(); err == nil {
		t.Error("ToOKLCH: expected error")
	}
}
