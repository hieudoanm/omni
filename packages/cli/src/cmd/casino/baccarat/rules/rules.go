package rules

import "github.com/hieudoanm/omni/packages/cli/src/cmd/casino/internal"

func CardValue(c internal.Card) int {
	if c.Rank >= 10 {
		return 0
	}
	return c.Rank
}

func HandSum(cards []internal.Card) int {
	var s int
	for _, c := range cards {
		s += CardValue(c)
	}
	return s % 10
}

func ShouldDraw(cards []internal.Card) bool {
	v := HandSum(cards)
	return v <= 5
}

func DrawForThird(cards []internal.Card, playerThird int) bool {
	v := HandSum(cards)
	switch {
	case v <= 2:
		return true
	case v == 3:
		return playerThird != 8
	case v == 4:
		return playerThird >= 2 && playerThird <= 7
	case v == 5:
		return playerThird >= 4 && playerThird <= 7
	case v == 6:
		return playerThird == 6 || playerThird == 7
	default:
		return false
	}
}
