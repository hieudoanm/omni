package internal

import (
	"testing"
)

func TestHexToRGB(t *testing.T) {
	tests := []struct {
		hex       Hex
		r, g, b   int
		shouldErr bool
	}{
		{Hex("#FF0000"), 255, 0, 0, false},
		{Hex("#00FF00"), 0, 255, 0, false},
		{Hex("#0000FF"), 0, 0, 255, false},
		{Hex("#000000"), 0, 0, 0, false},
		{Hex("#FFFFFF"), 255, 255, 255, false},
		{Hex("#F00"), 255, 0, 0, false},
		{Hex("#0F0"), 0, 255, 0, false},
		{Hex("00FF00"), 0, 255, 0, false},
		{Hex("#XYZ"), 0, 0, 0, true},
		{Hex("#00"), 0, 0, 0, true},
		{Hex(""), 0, 0, 0, true},
	}
	for _, tt := range tests {
		r, g, b, err := tt.hex.ToRGB()
		if tt.shouldErr {
			if err == nil {
				t.Errorf("%q: expected error", string(tt.hex))
			}
			continue
		}
		if err != nil {
			t.Errorf("%q: unexpected error: %v", string(tt.hex), err)
			continue
		}
		if r != tt.r || g != tt.g || b != tt.b {
			t.Errorf("%q: got (%d,%d,%d), want (%d,%d,%d)", string(tt.hex), r, g, b, tt.r, tt.g, tt.b)
		}
	}
}

func TestHexToHSL(t *testing.T) {
	H, S, L, err := Hex("#00FF00").ToHSL()
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if !approxEq(H, 120, 0.01) || !approxEq(S, 100, 0.01) || !approxEq(L, 50, 0.01) {
		t.Errorf("ToHSL() = (%.4f, %.4f, %.4f), want (120, 100, 50)", H, S, L)
	}
}

func TestHexToOKLCH(t *testing.T) {
	L, C, H, err := Hex("#FF0000").ToOKLCH()
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

func TestHexToHCL(t *testing.T) {
	H, C, L, err := Hex("#0000FF").ToHCL()
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if H < 0 || H > 360 {
		t.Errorf("hue out of range: %.4f", H)
	}
	if L <= 0 {
		t.Errorf("lightness too low: %.4f", L)
	}
	if C < 0 {
		t.Errorf("chroma negative: %.4f", C)
	}
}

func TestHexToCMYK(t *testing.T) {
	C, M, Y, K, err := Hex("#FF0000").ToCMYK()
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if C != 0 || !approxEq(M, 1, 0.01) || !approxEq(Y, 1, 0.01) || K != 0 {
		t.Errorf("ToCMYK() = (%.4f, %.4f, %.4f, %.4f), want (0, 1, 1, 0)", C, M, Y, K)
	}
}

func TestHexInvalidReturnsError(t *testing.T) {
	if _, _, _, err := Hex("#XYZ").ToRGB(); err == nil {
		t.Error("ToRGB: expected error for invalid hex")
	}
	if _, _, _, err := Hex("").ToRGB(); err == nil {
		t.Error("ToRGB: expected error for empty hex")
	}
	if _, _, _, _, err := Hex("#XYZ").ToCMYK(); err == nil {
		t.Error("ToCMYK: expected error for invalid hex")
	}
}

func TestGenerateRandomHexColor(t *testing.T) {
	color := GenerateRandomHexColor()
	if !IsValidHex(color) {
		t.Errorf("generated invalid hex color: %s", color)
	}
}

func TestIsValidHex(t *testing.T) {
	valid := []string{"#FFF", "#fff", "000000", "#ABCDEF", "#abcdef", "abc"}
	invalid := []string{"#GHI", "1234", "#12345", "#1234567", "", "##FF0000"}
	for _, v := range valid {
		if !IsValidHex(v) {
			t.Errorf("expected valid: %q", v)
		}
	}
	for _, v := range invalid {
		if IsValidHex(v) {
			t.Errorf("expected invalid: %q", v)
		}
	}
}

func TestHexToRGBEdgeCases(t *testing.T) {
	tests := []struct {
		hex       Hex
		r, g, b   int
		shouldErr bool
	}{
		{Hex("#FF00FF"), 255, 0, 255, false},
		{Hex("#00FFFF"), 0, 255, 255, false},
		{Hex("#FFFF00"), 255, 255, 0, false},
		{Hex("#"), 0, 0, 0, true},
		{Hex("#12"), 0, 0, 0, true},
		{Hex("#12345"), 0, 0, 0, true},
		{Hex("######"), 0, 0, 0, true},
	}
	for _, tt := range tests {
		r, g, b, err := tt.hex.ToRGB()
		if tt.shouldErr {
			if err == nil {
				t.Errorf("%q: expected error", string(tt.hex))
			}
			continue
		}
		if err != nil {
			t.Errorf("%q: unexpected error: %v", string(tt.hex), err)
			continue
		}
		if r != tt.r || g != tt.g || b != tt.b {
			t.Errorf("%q: got (%d,%d,%d), want (%d,%d,%d)", string(tt.hex), r, g, b, tt.r, tt.g, tt.b)
		}
	}
}

func TestHexToHSL_KnownValues(t *testing.T) {
	tests := []struct {
		name    string
		hex     Hex
		h, s, l float64
	}{
		{"red", Hex("#FF0000"), 0, 100, 50},
		{"lime", Hex("#00FF00"), 120, 100, 50},
		{"blue", Hex("#0000FF"), 240, 100, 50},
		{"black", Hex("#000000"), 0, 0, 0},
		{"white", Hex("#FFFFFF"), 0, 0, 100},
	}
	eps := 0.01
	for _, tt := range tests {
		h, s, l, err := tt.hex.ToHSL()
		if err != nil {
			t.Errorf("%s: unexpected error: %v", tt.name, err)
			continue
		}
		if !approxEq(h, tt.h, eps) || !approxEq(s, tt.s, eps) || !approxEq(l, tt.l, eps) {
			t.Errorf("%s: got (%.4f, %.4f, %.4f), want (%.4f, %.4f, %.4f)", tt.name, h, s, l, tt.h, tt.s, tt.l)
		}
	}
}

func TestHexInvalidReturnsErrorForAll(t *testing.T) {
	invalid := Hex("notahex")
	if _, _, _, err := invalid.ToRGB(); err == nil {
		t.Error("ToRGB: expected error")
	}
	if _, _, _, err := invalid.ToHSL(); err == nil {
		t.Error("ToHSL: expected error")
	}
	if _, _, _, err := invalid.ToOKLCH(); err == nil {
		t.Error("ToOKLCH: expected error")
	}
	if _, _, _, err := invalid.ToHCL(); err == nil {
		t.Error("ToHCL: expected error")
	}
	if _, _, _, _, err := invalid.ToCMYK(); err == nil {
		t.Error("ToCMYK: expected error")
	}
}

func TestHexToCMYK_KnownValues(t *testing.T) {
	tests := []struct {
		name       string
		hex        Hex
		c, m, y, k float64
	}{
		{"red", Hex("#FF0000"), 0, 1, 1, 0},
		{"black", Hex("#000000"), 0, 0, 0, 1},
		{"white", Hex("#FFFFFF"), 0, 0, 0, 0},
	}
	eps := 0.01
	for _, tt := range tests {
		c, m, y, k, err := tt.hex.ToCMYK()
		if err != nil {
			t.Errorf("%s: unexpected error: %v", tt.name, err)
			continue
		}
		if !approxEq(c, tt.c, eps) || !approxEq(m, tt.m, eps) || !approxEq(y, tt.y, eps) || !approxEq(k, tt.k, eps) {
			t.Errorf("%s: got (%.4f, %.4f, %.4f, %.4f), want (%.4f, %.4f, %.4f, %.4f)", tt.name, c, m, y, k, tt.c, tt.m, tt.y, tt.k)
		}
	}
}

func TestIsValidHexEdgeCases(t *testing.T) {
	valid := []string{"#aBcDeF", "#123ABC", "FFF", "f00"}
	invalid := []string{"#12 345", "#-12345", "##FFFFFF", "#ABCDE", "1234567", "gggggg"}
	for _, v := range valid {
		if !IsValidHex(v) {
			t.Errorf("expected valid: %q", v)
		}
	}
	for _, v := range invalid {
		if IsValidHex(v) {
			t.Errorf("expected invalid: %q", v)
		}
	}
}
