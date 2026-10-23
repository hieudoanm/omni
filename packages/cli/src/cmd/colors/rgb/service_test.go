package rgb

import (
	"strings"
	"testing"
)

func TestConvertRGB_Valid(t *testing.T) {
	tests := []struct {
		name    string
		r, g, b int
	}{
		{"red", 255, 0, 0},
		{"green", 0, 255, 0},
		{"blue", 0, 0, 255},
		{"black", 0, 0, 0},
		{"white", 255, 255, 255},
		{"gray", 128, 128, 128},
		{"yellow", 255, 255, 0},
		{"cyan", 0, 255, 255},
		{"magenta", 255, 0, 255},
		{"orange", 255, 165, 0},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result := convertRGB(tt.r, tt.g, tt.b)
			if !strings.Contains(result, "HEX") {
				t.Errorf("convertRGB(%d,%d,%d) missing HEX, got %q", tt.r, tt.g, tt.b, result)
			}
			if !strings.Contains(result, "HSL") {
				t.Errorf("convertRGB(%d,%d,%d) missing HSL, got %q", tt.r, tt.g, tt.b, result)
			}
			if !strings.Contains(result, "HCL") {
				t.Errorf("convertRGB(%d,%d,%d) missing HCL, got %q", tt.r, tt.g, tt.b, result)
			}
			if !strings.Contains(result, "OKLCH") {
				t.Errorf("convertRGB(%d,%d,%d) missing OKLCH, got %q", tt.r, tt.g, tt.b, result)
			}
			if !strings.Contains(result, "CMYK") {
				t.Errorf("convertRGB(%d,%d,%d) missing CMYK, got %q", tt.r, tt.g, tt.b, result)
			}
		})
	}
}

func TestConvertRGB_Invalid(t *testing.T) {
	tests := []struct {
		name    string
		r, g, b int
	}{
		{"R > 255", 300, 0, 0},
		{"R < 0", -5, 0, 0},
		{"G > 255", 0, 300, 0},
		{"G < 0", 0, -5, 0},
		{"B > 255", 0, 0, 300},
		{"B < 0", 0, 0, -5},
		{"all invalid", 999, 999, 999},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result := convertRGB(tt.r, tt.g, tt.b)
			if !strings.Contains(result, "Error (HEX)") {
				t.Errorf("convertRGB(%d,%d,%d) expected Error (HEX), got %q", tt.r, tt.g, tt.b, result)
			}
			if !strings.Contains(result, "Error (HSL)") {
				t.Errorf("convertRGB(%d,%d,%d) expected Error (HSL), got %q", tt.r, tt.g, tt.b, result)
			}
			if !strings.Contains(result, "Error (HCL)") {
				t.Errorf("convertRGB(%d,%d,%d) expected Error (HCL), got %q", tt.r, tt.g, tt.b, result)
			}
			if !strings.Contains(result, "Error (OKLCH)") {
				t.Errorf("convertRGB(%d,%d,%d) expected Error (OKLCH), got %q", tt.r, tt.g, tt.b, result)
			}
			if !strings.Contains(result, "Error (CMYK)") {
				t.Errorf("convertRGB(%d,%d,%d) expected Error (CMYK), got %q", tt.r, tt.g, tt.b, result)
			}
		})
	}
}
