package hex

import (
	"strings"
	"testing"
)

func TestConvertHex_Valid(t *testing.T) {
	tests := []struct {
		name string
		hex  string
	}{
		{"red", "#FF0000"},
		{"green", "#00FF00"},
		{"blue", "#0000FF"},
		{"black", "#000000"},
		{"white", "#FFFFFF"},
		{"short form", "#F00"},
		{"no hash", "FF0000"},
		{"lowercase", "#ff6600"},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result := convertHex(tt.hex)
			if !strings.Contains(result, "RGB") {
				t.Errorf("convertHex(%q) missing RGB, got %q", tt.hex, result)
			}
			if !strings.Contains(result, "HSL") {
				t.Errorf("convertHex(%q) missing HSL, got %q", tt.hex, result)
			}
			if !strings.Contains(result, "HCL") {
				t.Errorf("convertHex(%q) missing HCL, got %q", tt.hex, result)
			}
			if !strings.Contains(result, "OKLCH") {
				t.Errorf("convertHex(%q) missing OKLCH, got %q", tt.hex, result)
			}
			if !strings.Contains(result, "CMYK") {
				t.Errorf("convertHex(%q) missing CMYK, got %q", tt.hex, result)
			}
		})
	}
}

func TestConvertHex_Invalid(t *testing.T) {
	tests := []struct {
		name string
		hex  string
	}{
		{"invalid chars", "#XYZ"},
		{"too short", "#00"},
		{"too long", "#1234567"},
		{"empty", ""},
		{"just hash", "#"},
		{"5 chars", "#12345"},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result := convertHex(tt.hex)
			if !strings.Contains(result, "Error (RGB)") {
				t.Errorf("convertHex(%q) expected Error (RGB), got %q", tt.hex, result)
			}
			if strings.Contains(result, "HSL") {
				t.Errorf("convertHex(%q) should not contain HSL on error, got %q", tt.hex, result)
			}
		})
	}
}
