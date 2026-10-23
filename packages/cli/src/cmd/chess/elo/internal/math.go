package internal

import (
	"math"
	"strconv"
	"strings"
)

func ExpectedScore(player, opponent float64) float64 {
	return 1 / (1 + math.Pow(10, (opponent-player)/400))
}

func RatingChange(player, opponent, score, k float64) (delta, newRating float64) {
	exp := ExpectedScore(player, opponent)
	delta = k * (score - exp)
	newRating = player + delta
	return
}

type GameResult struct {
	Opponent     float64
	Result       string
	Score        float64
	Expected     float64
	RatingChange float64
}

func TournamentGames(start, k float64, opponents []float64, results []string) (games []GameResult, totalDelta float64) {
	for i, opp := range opponents {
		score, _ := ResultToScore(results[i])
		exp := ExpectedScore(start, opp)
		delta := k * (score - exp)
		totalDelta += delta
		games = append(games, GameResult{
			Opponent:     opp,
			Result:       results[i],
			Score:        score,
			Expected:     exp,
			RatingChange: delta,
		})
	}
	return
}

func PerformanceRating(ratings []float64, score float64, games int) (avg, tpr float64) {
	var sum float64
	for _, r := range ratings {
		sum += r
	}
	avg = sum / float64(len(ratings))

	if games > len(ratings) {
		games = len(ratings)
	}

	denom := float64(games) - score
	switch {
	case score == 0:
		tpr = avg - 800
	case score == float64(games):
		tpr = avg + 800
	default:
		tpr = avg + 400*math.Log10(score/denom)
	}
	return
}

func RequiredScore(avg, games, target float64) (score, pct float64) {
	diff := target - avg
	ratio := math.Pow(10, diff/400)
	score = (ratio * games) / (1 + ratio)
	if score < 0 {
		score = 0
	} else if score > games {
		score = games
	}
	pct = (score / games) * 100
	return
}

func DiffToExpected(diff float64) float64 {
	return 1 / (1 + math.Pow(10, -diff/400))
}

func ExpectedToDiff(exp float64) float64 {
	return -400 * math.Log10((1/exp)-1)
}

func ParseFloats(s string) []float64 {
	parts := strings.Split(s, ",")
	var vals []float64
	for _, p := range parts {
		p = strings.TrimSpace(p)
		if p == "" {
			continue
		}
		v, err := strconv.ParseFloat(p, 64)
		if err != nil {
			return nil
		}
		vals = append(vals, v)
	}
	return vals
}

func ResultToScore(r string) (float64, error) {
	switch strings.TrimSpace(r) {
	case "win", "1":
		return 1.0, nil
	case "draw", "0.5":
		return 0.5, nil
	case "loss", "0":
		return 0.0, nil
	}
	return 0, ErrInvalidResult
}

var ErrInvalidResult = &resultError{}

type resultError struct{}

func (e *resultError) Error() string { return "invalid result; use win/draw/loss" }
