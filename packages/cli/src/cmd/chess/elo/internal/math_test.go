package internal

import (
	"math"
	"testing"
)

func TestExpectedScore_equal(t *testing.T) {
	got := ExpectedScore(1500, 1500)
	if math.Abs(got-0.5) > 0.001 {
		t.Errorf("ExpectedScore(1500,1500) = %.4f, want 0.5", got)
	}
}

func TestExpectedScore_stronger(t *testing.T) {
	got := ExpectedScore(1600, 1500)
	if got <= 0.5 {
		t.Errorf("ExpectedScore(1600,1500) = %.4f, want >0.5", got)
	}
}

func TestExpectedScore_weaker(t *testing.T) {
	got := ExpectedScore(1400, 1500)
	if got >= 0.5 {
		t.Errorf("ExpectedScore(1400,1500) = %.4f, want <0.5", got)
	}
}

func TestExpectedScore_known(t *testing.T) {
	got := ExpectedScore(1500, 1700)
	want := 1 / (1 + math.Pow(10, 200.0/400))
	if math.Abs(got-want) > 0.0001 {
		t.Errorf("ExpectedScore(1500,1700) = %.4f, want %.4f", got, want)
	}
}

func TestRatingChange(t *testing.T) {
	delta, newRating := RatingChange(1500, 1500, 1, 20)
	// Expected score = 0.5, delta = 20 * (1 - 0.5) = 10
	if math.Abs(delta-10) > 0.01 {
		t.Errorf("delta = %.2f, want 10", delta)
	}
	if math.Abs(newRating-1510) > 0.01 {
		t.Errorf("newRating = %.2f, want 1510", newRating)
	}
}

func TestRatingChange_loss(t *testing.T) {
	delta, _ := RatingChange(1500, 1700, 0, 20)
	// Expected score = ~0.24, delta = 20 * (0 - 0.24) = -4.8
	if delta >= 0 {
		t.Errorf("expected negative delta for loss vs stronger, got %.2f", delta)
	}
}

func TestPerformanceRating_undefeated(t *testing.T) {
	avg, tpr := PerformanceRating([]float64{1500, 1600, 1700}, 3, 3)
	if tpr <= avg+700 {
		t.Errorf("TPR for 3/3 should be high, avg=%.0f, tpr=%.0f", avg, tpr)
	}
}

func TestPerformanceRating_winless(t *testing.T) {
	avg, tpr := PerformanceRating([]float64{1500, 1600, 1700}, 0, 3)
	if tpr >= avg-700 {
		t.Errorf("TPR for 0/3 should be low, avg=%.0f, tpr=%.0f", avg, tpr)
	}
}

func TestPerformanceRating_mixed(t *testing.T) {
	avg, tpr := PerformanceRating([]float64{1500, 1600, 1700}, 2, 3)
	if tpr <= avg || tpr > 2000 {
		t.Errorf("TPR for 2/3 should be reasonable, avg=%.0f, tpr=%.0f", avg, tpr)
	}
}

func TestRequiredScore(t *testing.T) {
	score, pct := RequiredScore(1500, 10, 1600)
	if score <= 0 || score > 10 {
		t.Errorf("RequiredScore(1500,10,1600) = %.2f, want between 0 and 10", score)
	}
	if pct <= 0 || pct > 100 {
		t.Errorf("pct = %.2f, want between 0 and 100", pct)
	}
}

func TestRequiredScore_impossible(t *testing.T) {
	score, _ := RequiredScore(1500, 10, 3000)
	if score > 10 || score < 0 {
		t.Errorf("RequiredScore(1500,10,3000) = %.2f, want clamped to [0,10]", score)
	}
}

func TestDiffToExpected(t *testing.T) {
	tests := []struct {
		diff float64
	}{
		{0},
		{100},
		{-100},
		{400},
	}
	for _, tt := range tests {
		got := DiffToExpected(tt.diff)
		if got <= 0 || got >= 1 {
			t.Errorf("DiffToExpected(%.0f) = %.4f, want between 0 and 1", tt.diff, got)
		}
	}
}

func TestDiffToExpected_known(t *testing.T) {
	got := DiffToExpected(200)
	// 1 / (1 + 10^(-200/400)) = 1 / (1 + 10^-0.5) = 1 / (1 + 0.316...) = ~0.76
	if math.Abs(got-0.76) > 0.01 {
		t.Errorf("DiffToExpected(200) = %.4f, want ~0.76", got)
	}
}

func TestExpectedToDiff(t *testing.T) {
	// Round trip
	exp := 0.75
	diff := ExpectedToDiff(exp)
	back := DiffToExpected(diff)
	if math.Abs(back-exp) > 0.001 {
		t.Errorf("expected round trip: got %.4f, want %.4f", back, exp)
	}
}

func TestParseFloats_normal(t *testing.T) {
	got := ParseFloats("1500,1600,1700")
	if len(got) != 3 {
		t.Fatalf("got %d values, want 3", len(got))
	}
	if got[0] != 1500 || got[1] != 1600 || got[2] != 1700 {
		t.Errorf("got %v, want [1500 1600 1700]", got)
	}
}

func TestParseFloats_spaces(t *testing.T) {
	got := ParseFloats("1500, 1600, 1700")
	if len(got) != 3 {
		t.Fatalf("got %d values, want 3", len(got))
	}
}

func TestParseFloats_single(t *testing.T) {
	got := ParseFloats("1500")
	if len(got) != 1 || got[0] != 1500 {
		t.Errorf("got %v, want [1500]", got)
	}
}

func TestParseFloats_empty(t *testing.T) {
	got := ParseFloats("")
	if len(got) != 0 {
		t.Errorf("got %v, want empty", got)
	}
}

func TestParseFloats_invalid(t *testing.T) {
	got := ParseFloats("abc")
	if got != nil {
		t.Errorf("got %v, want nil", got)
	}
}

func TestResultToScore_win(t *testing.T) {
	for _, r := range []string{"win", "1"} {
		got, err := ResultToScore(r)
		if err != nil {
			t.Errorf("ResultToScore(%q) error: %v", r, err)
		}
		if got != 1.0 {
			t.Errorf("ResultToScore(%q) = %.1f, want 1.0", r, got)
		}
	}
}

func TestResultToScore_draw(t *testing.T) {
	for _, r := range []string{"draw", "0.5"} {
		got, err := ResultToScore(r)
		if err != nil {
			t.Errorf("ResultToScore(%q) error: %v", r, err)
		}
		if got != 0.5 {
			t.Errorf("ResultToScore(%q) = %.1f, want 0.5", r, got)
		}
	}
}

func TestResultToScore_loss(t *testing.T) {
	for _, r := range []string{"loss", "0"} {
		got, err := ResultToScore(r)
		if err != nil {
			t.Errorf("ResultToScore(%q) error: %v", r, err)
		}
		if got != 0.0 {
			t.Errorf("ResultToScore(%q) = %.1f, want 0.0", r, got)
		}
	}
}

func TestResultToScore_invalid(t *testing.T) {
	_, err := ResultToScore("invalid")
	if err == nil {
		t.Fatal("expected error for invalid result")
	}
}

func TestTournamentGames(t *testing.T) {
	games, totalDelta := TournamentGames(1500, 20, []float64{1500, 1600, 1400}, []string{"win", "loss", "win"})
	if len(games) != 3 {
		t.Fatalf("got %d games, want 3", len(games))
	}
	if totalDelta == 0 {
		t.Error("expected non-zero total delta")
	}
	if games[0].Opponent != 1500 {
		t.Errorf("first opponent = %.0f, want 1500", games[0].Opponent)
	}
}
