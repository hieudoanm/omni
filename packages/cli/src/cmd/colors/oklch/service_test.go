package oklch

import (
	"strings"
	"testing"
)

func TestConvertOKLCH_Valid(t *testing.T) {
	tests := []struct {
		name    string
		L, C, H float64
	}{
		{"red-ish", 0.5, 0.1, 0},
		{"green-ish", 0.5, 0.1, 120},
		{"blue-ish", 0.5, 0.1, 240},
		{"gray", 0.5, 0, 0},
		{"light", 0.9, 0.05, 60},
		{"dark", 0.1, 0.05, 300},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result := convertOKLCH(tt.L, tt.C, tt.H)
			if !strings.Contains(result, "HEX") {
				t.Errorf("convertOKLCH(%v,%v,%v) missing HEX, got %q", tt.L, tt.C, tt.H, result)
			}
			if !strings.Contains(result, "RGB") {
				t.Errorf("convertOKLCH(%v,%v,%v) missing RGB, got %q", tt.L, tt.C, tt.H, result)
			}
			if !strings.Contains(result, "HSL") {
				t.Errorf("convertOKLCH(%v,%v,%v) missing HSL, got %q", tt.L, tt.C, tt.H, result)
			}
			if !strings.Contains(result, "HCL") {
				t.Errorf("convertOKLCH(%v,%v,%v) missing HCL, got %q", tt.L, tt.C, tt.H, result)
			}
			if !strings.Contains(result, "CMYK") {
				t.Errorf("convertOKLCH(%v,%v,%v) missing CMYK, got %q", tt.L, tt.C, tt.H, result)
			}
		})
	}
}

func TestConvertOKLCH_Invalid(t *testing.T) {
	tests := []struct {
		name    string
		L, C, H float64
	}{
		{"L < 0", -0.1, 0.1, 180},
		{"L > 1", 1.5, 0.1, 180},
		{"C < 0", 0.5, -0.1, 180},
		{"H < 0", 0.5, 0.1, -10},
		{"H > 360", 0.5, 0.1, 400},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result := convertOKLCH(tt.L, tt.C, tt.H)
			if !strings.Contains(result, "Error (RGB)") {
				t.Errorf("convertOKLCH(%v,%v,%v) expected Error (RGB), got %q", tt.L, tt.C, tt.H, result)
			}
		})
	}
}

func TestConvertOKLCH_EdgeCases(t *testing.T) {
	tests := []struct {
		name    string
		L, C, H float64
	}{
		{"black", 0, 0, 0},
		{"white", 1, 0, 0},
		{"mid gray", 0.5, 0, 0},
		{"hue 360", 0.5, 0.1, 360},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result := convertOKLCH(tt.L, tt.C, tt.H)
			if !strings.Contains(result, "HEX") && !strings.Contains(result, "Error") {
				t.Errorf("convertOKLCH(%v,%v,%v) unexpected result, got %q", tt.L, tt.C, tt.H, result)
			}
		})
	}
}
