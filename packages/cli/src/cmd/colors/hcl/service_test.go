package hcl

import (
	"strings"
	"testing"
)

func TestConvertHCL_Valid(t *testing.T) {
	tests := []struct {
		name    string
		h, c, l float64
	}{
		{"red hue", 0, 50, 50},
		{"green hue", 120, 50, 50},
		{"blue hue", 240, 50, 50},
		{"low chroma", 180, 10, 50},
		{"high lightness", 60, 30, 90},
		{"low lightness", 300, 40, 10},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result := convertHCL(tt.h, tt.c, tt.l)
			if !strings.Contains(result, "HEX") {
				t.Errorf("convertHCL(%v,%v,%v) missing HEX, got %q", tt.h, tt.c, tt.l, result)
			}
			if !strings.Contains(result, "RGB") {
				t.Errorf("convertHCL(%v,%v,%v) missing RGB, got %q", tt.h, tt.c, tt.l, result)
			}
			if !strings.Contains(result, "HSL") {
				t.Errorf("convertHCL(%v,%v,%v) missing HSL, got %q", tt.h, tt.c, tt.l, result)
			}
			if !strings.Contains(result, "OKLCH") {
				t.Errorf("convertHCL(%v,%v,%v) missing OKLCH, got %q", tt.h, tt.c, tt.l, result)
			}
			if !strings.Contains(result, "CMYK") {
				t.Errorf("convertHCL(%v,%v,%v) missing CMYK, got %q", tt.h, tt.c, tt.l, result)
			}
		})
	}
}

func TestConvertHCL_InvalidHCL(t *testing.T) {
	tests := []struct {
		name    string
		h, c, l float64
	}{
		{"hue > 360", 400, 50, 50},
		{"hue < 0", -10, 50, 50},
		{"chroma < 0", 180, -1, 50},
		{"lightness < 0", 180, 50, -5},
		{"lightness > 100", 180, 50, 110},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result := convertHCL(tt.h, tt.c, tt.l)
			if !strings.Contains(result, "Error (RGB)") {
				t.Errorf("convertHCL(%v,%v,%v) expected Error (RGB), got %q", tt.h, tt.c, tt.l, result)
			}
			if strings.Contains(result, "HSL") {
				t.Errorf("convertHCL(%v,%v,%v) should not contain HSL on error, got %q", tt.h, tt.c, tt.l, result)
			}
		})
	}
}

func TestConvertHCL_EdgeCases(t *testing.T) {
	tests := []struct {
		name    string
		h, c, l float64
	}{
		{"zero values", 0, 0, 0},
		{"max lightness", 0, 0, 100},
		{"hue 360 edge", 360, 50, 50},
		{"chroma 0", 180, 0, 50},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result := convertHCL(tt.h, tt.c, tt.l)
			if !strings.Contains(result, "HEX") && !strings.Contains(result, "Error") {
				t.Errorf("convertHCL(%v,%v,%v) unexpected result, got %q", tt.h, tt.c, tt.l, result)
			}
		})
	}
}
