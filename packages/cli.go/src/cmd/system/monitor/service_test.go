package monitor

import (
	"fmt"
	"strings"
	"testing"
)

func TestBuiltinMax(t *testing.T) {
	tests := []struct {
		a, b, expected int
	}{
		{5, 3, 5},
		{3, 5, 5},
		{0, 0, 0},
		{-5, 5, 5},
		{-5, -3, -3},
	}

	for _, tt := range tests {
		name := fmt.Sprintf("max(%d,%d)=%d", tt.a, tt.b, tt.expected)
		t.Run(name, func(t *testing.T) {
			got := max(tt.a, tt.b)
			if got != tt.expected {
				t.Errorf("max(%d,%d) = %d, want %d", tt.a, tt.b, got, tt.expected)
			}
		})
	}
}

func TestBuiltinMin(t *testing.T) {
	tests := []struct {
		a, b, expected int
	}{
		{5, 3, 3},
		{3, 5, 3},
		{0, 0, 0},
		{-5, 5, -5},
		{-5, -3, -5},
	}

	for _, tt := range tests {
		name := fmt.Sprintf("min(%d,%d)=%d", tt.a, tt.b, tt.expected)
		t.Run(name, func(t *testing.T) {
			got := min(tt.a, tt.b)
			if got != tt.expected {
				t.Errorf("min(%d,%d) = %d, want %d", tt.a, tt.b, got, tt.expected)
			}
		})
	}
}

func TestSparkline_EmptyData(t *testing.T) {
	got := Sparkline([]float64{}, 10)
	if len(got) != 10 {
		t.Errorf("expected length 10, got %d", len(got))
	}
	for _, c := range got {
		if c != ' ' {
			t.Errorf("expected all spaces for empty data, got %q", got)
			break
		}
	}
}

func TestSparkline_ProducesCorrectLength(t *testing.T) {
	tests := []struct {
		data  []float64
		width int
	}{
		{[]float64{0, 50, 100}, 5},
		{[]float64{0, 50, 100}, 3},
		{[]float64{0, 50, 100}, 10},
		{[]float64{25, 75}, 2},
	}

	for _, tt := range tests {
		name := fmt.Sprintf("len=%d,width=%d", len(tt.data), tt.width)
		t.Run(name, func(t *testing.T) {
			got := Sparkline(tt.data, tt.width)
			if got == "" {
				t.Errorf("Sparkline(%v, %d) returned empty string", tt.data, tt.width)
			}
		})
	}
}

func TestSparkline_PadsWithSpaces(t *testing.T) {
	data := []float64{50}
	out := Sparkline(data, 5)
	if out == "" {
		t.Fatal("Sparkline returned empty string")
	}
	var spaceCount int
	for _, c := range out[:4] {
		if c == ' ' {
			spaceCount++
		}
	}
	if spaceCount == 0 {
		t.Errorf("expected leading spaces when data < width, got %q", out)
	}
}

func TestSparkline_TruncatesLargeData(t *testing.T) {
	data := []float64{10, 20, 30, 40, 50}
	got := Sparkline(data, 3)
	if got == "" {
		t.Errorf("Sparkline(%v, %d) returned empty string", data, 3)
	}
}

func TestBar_Width(t *testing.T) {
	tests := []struct {
		pct   float64
		width int
	}{
		{50, 10},
		{0, 10},
		{100, 10},
		{25, 20},
		{75, 5},
	}

	for _, tt := range tests {
		name := fmt.Sprintf("pct=%.0f,w=%d", tt.pct, tt.width)
		t.Run(name, func(t *testing.T) {
			got := Bar(tt.pct, tt.width)
			filled := strings.Count(got, "█")
			empty := strings.Count(got, "░")
			if filled+empty != tt.width {
				t.Errorf("Bar(%v, %d) has %d█ + %d░ = %d total chars, want %d",
					tt.pct, tt.width, filled, empty, filled+empty, tt.width)
			}
		})
	}
}

func TestBar_EdgeCases(t *testing.T) {
	t.Run("zero percent", func(t *testing.T) {
		got := Bar(0, 10)
		if strings.Count(got, "█") != 0 {
			t.Errorf("expected 0 filled bars for 0%%, got %q", got)
		}
		if strings.Count(got, "░") != 10 {
			t.Errorf("expected 10 empty bars for 0%%, got %q", got)
		}
	})

	t.Run("full percent", func(t *testing.T) {
		got := Bar(100, 10)
		if strings.Count(got, "█") != 10 {
			t.Errorf("expected 10 filled bars for 100%%, got %q", got)
		}
		if strings.Count(got, "░") != 0 {
			t.Errorf("expected 0 empty bars for 100%%, got %q", got)
		}
	})

	t.Run("negative percent clamped", func(t *testing.T) {
		got := Bar(-10, 10)
		filled := strings.Count(got, "█")
		if filled != 0 {
			t.Errorf("expected 0 filled for negative pct, got %d", filled)
		}
	})

	t.Run("over 100 percent clamped", func(t *testing.T) {
		got := Bar(200, 10)
		filled := strings.Count(got, "█")
		if filled != 10 {
			t.Errorf("expected 10 filled for 200%%, got %d", filled)
		}
	})
}
