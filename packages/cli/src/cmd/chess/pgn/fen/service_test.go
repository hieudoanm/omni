package fen

import (
	"testing"

	"github.com/hieudoanm/omni/packages/cli/src/cmd/chess/internal"
)

func TestClassifyMove(t *testing.T) {
	tests := []struct {
		cp   int
		want string
	}{
		{0, "Best"},
		{10, "Best"},
		{20, "Best"},
		{21, "Good"},
		{50, "Good"},
		{51, "Inaccuracy"},
		{100, "Inaccuracy"},
		{101, "Mistake"},
		{200, "Mistake"},
		{201, "Blunder"},
		{500, "Blunder"},
	}

	for _, tt := range tests {
		t.Run(tt.want, func(t *testing.T) {
			got := classifyMove(tt.cp)
			if got != tt.want {
				t.Errorf("classifyMove(%d) = %q, want %q", tt.cp, got, tt.want)
			}
		})
	}
}

func TestAbs(t *testing.T) {
	tests := []struct {
		a    int
		want int
	}{
		{0, 0},
		{1, 1},
		{-1, 1},
		{100, 100},
		{-100, 100},
	}

	for _, tt := range tests {
		got := internal.Abs(tt.a)
		if got != tt.want {
			t.Errorf("Abs(%d) = %d, want %d", tt.a, got, tt.want)
		}
	}
}
