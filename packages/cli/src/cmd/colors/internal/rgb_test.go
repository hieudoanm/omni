package internal

import (
	"math"
	"testing"
)

func approxEq(a, b, eps float64) bool {
	return math.Abs(a-b) <= eps
}

func TestRGBIsValid(t *testing.T) {
	tests := []struct {
		rgb   RGB
		valid bool
	}{
		{RGB{255, 0, 0}, true},
		{RGB{0, 255, 0}, true},
		{RGB{0, 0, 255}, true},
		{RGB{0, 0, 0}, true},
		{RGB{255, 255, 255}, true},
		{RGB{128, 128, 128}, true},
		{RGB{256, 0, 0}, false},
		{RGB{0, -1, 0}, false},
		{RGB{0, 0, 300}, false},
	}
	for _, tt := range tests {
		got := tt.rgb.IsValid()
		if got != tt.valid {
			t.Errorf("RGB%+v.IsValid() = %v, want %v", tt.rgb, got, tt.valid)
		}
	}
}

func TestRGBToHex(t *testing.T) {
	tests := []struct {
		rgb RGB
		hex string
		err bool
	}{
		{RGB{255, 0, 0}, "#FF0000", false},
		{RGB{0, 255, 0}, "#00FF00", false},
		{RGB{0, 0, 255}, "#0000FF", false},
		{RGB{0, 0, 0}, "#000000", false},
		{RGB{255, 255, 255}, "#FFFFFF", false},
		{RGB{128, 128, 128}, "#808080", false},
		{RGB{256, 0, 0}, "", true},
	}
	for _, tt := range tests {
		hex, err := tt.rgb.ToHex()
		if tt.err && err == nil {
			t.Errorf("RGB%+v.ToHex() expected error", tt.rgb)
		}
		if !tt.err && (err != nil || hex != tt.hex) {
			t.Errorf("RGB%+v.ToHex() = %q, %v, want %q, nil", tt.rgb, hex, err, tt.hex)
		}
	}
}

func TestRGBToHSL(t *testing.T) {
	tests := []struct {
		name    string
		rgb     RGB
		h, s, l float64
	}{
		{"red", RGB{255, 0, 0}, 0, 100, 50},
		{"green", RGB{0, 255, 0}, 120, 100, 50},
		{"blue", RGB{0, 0, 255}, 240, 100, 50},
		{"black", RGB{0, 0, 0}, 0, 0, 0},
		{"white", RGB{255, 255, 255}, 0, 0, 100},
		{"gray", RGB{128, 128, 128}, 0, 0, 50.196},
	}
	eps := 0.01
	for _, tt := range tests {
		h, s, l, err := tt.rgb.ToHSL()
		if err != nil {
			t.Errorf("%s: unexpected error: %v", tt.name, err)
			continue
		}
		if !approxEq(h, tt.h, eps) || !approxEq(s, tt.s, eps) || !approxEq(l, tt.l, eps) {
			t.Errorf("%s: ToHSL() = (%.4f, %.4f, %.4f), want (%.4f, %.4f, %.4f)", tt.name, h, s, l, tt.h, tt.s, tt.l)
		}
	}
}

func TestRGBToCMYK(t *testing.T) {
	tests := []struct {
		name       string
		rgb        RGB
		c, m, y, k float64
	}{
		{"red", RGB{255, 0, 0}, 0, 100, 100, 0},
		{"green", RGB{0, 255, 0}, 100, 0, 100, 0},
		{"blue", RGB{0, 0, 255}, 100, 100, 0, 0},
		{"black", RGB{0, 0, 0}, 0, 0, 0, 1},
		{"white", RGB{255, 255, 255}, 0, 0, 0, 0},
	}
	eps := 0.01
	for _, tt := range tests {
		c, m, y, k, err := tt.rgb.ToCMYK()
		if err != nil {
			t.Errorf("%s: unexpected error: %v", tt.name, err)
			continue
		}
		if !approxEq(c, tt.c, eps) || !approxEq(m, tt.m, eps) || !approxEq(y, tt.y, eps) || !approxEq(k, tt.k, eps) {
			t.Errorf("%s: ToCMYK() = (%.4f, %.4f, %.4f, %.4f), want (%.4f, %.4f, %.4f, %.4f)", tt.name, c, m, y, k, tt.c, tt.m, tt.y, tt.k)
		}
	}
}

func TestRGBInvalidToCMYK(t *testing.T) {
	_, _, _, _, err := RGB{256, 0, 0}.ToCMYK()
	if err == nil {
		t.Error("expected error for invalid RGB")
	}
}

func TestRGBToHCL(t *testing.T) {
	h, c, l, err := RGB{255, 0, 0}.ToHCL()
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if h < 0 || h > 360 {
		t.Errorf("hue out of range: %.4f", h)
	}
	if l <= 0 || l > 100 {
		t.Errorf("lightness out of range: %.4f", l)
	}
	if c < 0 {
		t.Errorf("chroma negative: %.4f", c)
	}
}

func TestRGBToOKLCH(t *testing.T) {
	L, C, H, err := RGB{255, 0, 0}.ToOKLCH()
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

func TestRGBInvalidReturnsError(t *testing.T) {
	invalid := RGB{300, 0, 0}
	if _, err := invalid.ToHex(); err == nil {
		t.Error("ToHex: expected error")
	}
	if _, _, _, err := invalid.ToHSL(); err == nil {
		t.Error("ToHSL: expected error")
	}
	if _, _, _, _, err := invalid.ToCMYK(); err == nil {
		t.Error("ToCMYK: expected error")
	}
	if _, _, _, err := invalid.ToHCL(); err == nil {
		t.Error("ToHCL: expected error")
	}
	if _, _, _, err := invalid.ToOKLCH(); err == nil {
		t.Error("ToOKLCH: expected error")
	}
}

func TestRGBGrayRounding(t *testing.T) {
	c := RGB{128, 128, 128}
	h, s, l, _ := c.ToHSL()
	if math.Round(h) != 0 || math.Round(s) != 0 || math.Round(l) != 50 {
		t.Errorf("ToHSL for Gray failed: h=%v, s=%v, l=%v", h, s, l)
	}
}
