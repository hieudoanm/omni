package internal

import (
	"testing"
)

func TestHSLToHex(t *testing.T) {
	tests := []struct {
		name string
		hsl  HSL
		hex  string
	}{
		{"red", HSL{0, 1, 0.5}, "#ff0000"},
		{"green", HSL{120, 1, 0.5}, "#00ff00"},
		{"blue", HSL{240, 1, 0.5}, "#0000ff"},
		{"black", HSL{0, 0, 0}, "#000000"},
		{"white", HSL{0, 0, 1}, "#ffffff"},
		{"gray", HSL{0, 0, 0.5}, "#808080"},
	}
	for _, tt := range tests {
		got := HSLToHex(tt.hsl)
		if got != tt.hex {
			t.Errorf("%s: HSLToHex(%+v) = %q, want %q", tt.name, tt.hsl, got, tt.hex)
		}
	}
}

func TestHSLToRGB(t *testing.T) {
	tests := []struct {
		name    string
		h, s, l float64
		r, g, b int
	}{
		{"red", 0, 100, 50, 255, 0, 0},
		{"green", 120, 100, 50, 0, 255, 0},
		{"blue", 240, 100, 50, 0, 0, 255},
		{"black", 0, 0, 0, 0, 0, 0},
		{"white", 0, 0, 100, 255, 255, 255},
	}
	for _, tt := range tests {
		r, g, b := HSLToRGB(tt.h, tt.s, tt.l)
		if r != tt.r || g != tt.g || b != tt.b {
			t.Errorf("%s: HSLToRGB(%v,%v,%v) = (%d,%d,%d), want (%d,%d,%d)",
				tt.name, tt.h, tt.s, tt.l, r, g, b, tt.r, tt.g, tt.b)
		}
	}
}

func TestHSLToOKLCH(t *testing.T) {
	L, C, H := HSLToOKLCH(0, 100, 50)
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

func TestClampInt(t *testing.T) {
	tests := []struct {
		v        float64
		expected int
	}{
		{0, 0},
		{255, 255},
		{128.0, 128},
		{-1, 0},
		{300, 255},
		{127.5, 128},
		{127.4, 127},
	}
	for _, tt := range tests {
		got := clampInt(tt.v)
		if got != tt.expected {
			t.Errorf("clampInt(%v) = %d, want %d", tt.v, got, tt.expected)
		}
	}
}
