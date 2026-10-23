package count

import "testing"

func TestHiLoValue(t *testing.T) {
	tests := []struct {
		rank string
		want int
	}{
		{"2", +1},
		{"3", +1},
		{"4", +1},
		{"5", +1},
		{"6", +1},
		{"7", 0},
		{"8", 0},
		{"9", 0},
		{"10", -1},
		{"J", -1},
		{"Q", -1},
		{"K", -1},
		{"A", -1},
	}
	for _, tt := range tests {
		got := hiLoCountValue(tt.rank)
		if got != tt.want {
			t.Errorf("hiLoCountValue(%q) = %d, want %d", tt.rank, got, tt.want)
		}
	}
}

func TestHiLoValueAllRanks(t *testing.T) {
	expected := map[string]int{
		"2": +1, "3": +1, "4": +1, "5": +1, "6": +1,
		"7": 0, "8": 0, "9": 0,
		"10": -1, "J": -1, "Q": -1, "K": -1, "A": -1,
	}
	for rank, want := range expected {
		got := hiLoCountValue(rank)
		if got != want {
			t.Errorf("hiLoCountValue(%q) = %d, want %d", rank, got, want)
		}
	}
}

func TestHiLoValueUnknownRank(t *testing.T) {
	got := hiLoCountValue("X")
	if got != -1 {
		t.Errorf("hiLoCountValue(\"X\") = %d, want -1 (default)", got)
	}
}
