package internal

import "testing"

func TestGcd_basic(t *testing.T) {
	tests := []struct {
		a, b int64
		want int64
	}{
		{12, 8, 4},
		{54, 24, 6},
		{7, 13, 1},
		{100, 25, 25},
		{0, 5, 5},
		{5, 0, 5},
		{0, 0, 0},
		{1, 1, 1},
		{17, 17, 17},
		{1000000, 1, 1},
	}
	for _, tt := range tests {
		got := Gcd(tt.a, tt.b)
		if got != tt.want {
			t.Errorf("Gcd(%d, %d) = %d, want %d", tt.a, tt.b, got, tt.want)
		}
	}
}

func TestGcd_negative(t *testing.T) {
	tests := []struct {
		a, b int64
		want int64
	}{
		{-12, 8, 4},
		{12, -8, 4},
		{-12, -8, 4},
		{-7, 13, 1},
	}
	for _, tt := range tests {
		got := Gcd(tt.a, tt.b)
		if got != tt.want {
			t.Errorf("Gcd(%d, %d) = %d, want %d", tt.a, tt.b, got, tt.want)
		}
	}
}

func TestGcd_large(t *testing.T) {
	got := Gcd(123456789, 987654321)
	if got != 9 {
		t.Errorf("Gcd(123456789, 987654321) = %d, want 9", got)
	}
}
