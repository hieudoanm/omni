package palette

import (
	"strings"
	"testing"

	"github.com/hieudoanm/omni/packages/cli/src/cmd/colors/internal"
)

func TestComputePalette_ValidInputs(t *testing.T) {
	tests := []struct {
		name  string
		hex   internal.Hex
		style string
		want  []string
	}{
		{
			name:  "triadic with red",
			hex:   "#FF0000",
			style: "Balanced professional (Triadic)",
			want:  []string{"Base:", "Support:", "Accent:", "Generated"},
		},
		{
			name:  "complementary with blue",
			hex:   "#0000FF",
			style: "High-contrast (Complementary)",
			want:  []string{"Base:", "Support:", "Accent:", "Generated"},
		},
		{
			name:  "analogous with green",
			hex:   "#00FF00",
			style: "Soft aesthetic (Analogous)",
			want:  []string{"Base:", "Support:", "Accent:", "Generated"},
		},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result := computePalette(tt.hex, tt.style)
			for _, w := range tt.want {
				if !strings.Contains(result, w) {
					t.Errorf("computePalette(%q, %q) missing %q, got %q", string(tt.hex), tt.style, w, result)
				}
			}
		})
	}
}

func TestComputePalette_HueNormalization(t *testing.T) {
	tests := []struct {
		name  string
		hex   internal.Hex
		style string
	}{
		{"hue 0 triadic", "#FF0000", "Balanced professional (Triadic)"},
		{"hue 120 triadic", "#00FF00", "Balanced professional (Triadic)"},
		{"hue 240 triadic", "#0000FF", "Balanced professional (Triadic)"},
		{"hue 0 complementary", "#FF0000", "High-contrast (Complementary)"},
		{"hue 0 analogous", "#FF0000", "Soft aesthetic (Analogous)"},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result := computePalette(tt.hex, tt.style)
			if strings.Contains(result, "Error") {
				t.Errorf("computePalette(%q, %q) unexpected error, got %q", string(tt.hex), tt.style, result)
			}
			if !strings.Contains(result, "H=") {
				t.Errorf("computePalette(%q, %q) missing hue output, got %q", string(tt.hex), tt.style, result)
			}
			hexStart := strings.Index(result, "#")
			if hexStart == -1 {
				t.Errorf("computePalette(%q, %q) missing hex color, got %q", string(tt.hex), tt.style, result)
			}
		})
	}
}

func TestComputePalette_InvalidHex(t *testing.T) {
	result := computePalette("#XYZ", "Balanced professional (Triadic)")
	if !strings.Contains(result, "Error converting to HSL") {
		t.Errorf("expected error for invalid hex, got %q", result)
	}
}

func TestComputePalette_BlackAndWhite(t *testing.T) {
	tests := []struct {
		name  string
		hex   internal.Hex
		style string
	}{
		{"black triadic", "#000000", "Balanced professional (Triadic)"},
		{"white triadic", "#FFFFFF", "Balanced professional (Triadic)"},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result := computePalette(tt.hex, tt.style)
			if strings.Contains(result, "Error converting") {
				t.Errorf("computePalette(%q, %q) unexpected error, got %q", string(tt.hex), tt.style, result)
			}
		})
	}
}
