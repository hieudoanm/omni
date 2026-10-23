package hand

import (
	"sort"

	"github.com/hieudoanm/omni/packages/cli/src/cmd/casino/internal"
)

type Rank int

const (
	HighCard Rank = iota
	OnePair
	TwoPair
	ThreeOfAKind
	Straight
	Flush
	FullHouse
	FourOfAKind
	StraightFlush
)

func (r Rank) String() string {
	names := []string{
		"High Card", "One Pair", "Two Pair", "Three of a Kind",
		"Straight", "Flush", "Full House", "Four of a Kind", "Straight Flush",
	}
	if int(r) < len(names) {
		return names[r]
	}
	return "Unknown"
}

type Result struct {
	Rank  Rank
	Score int
}

func Eval5(cards [5]internal.Card) Result {
	counts := map[int]int{}
	for _, c := range cards {
		counts[c.Rank]++
	}

	pairs := []int{}
	var trips int
	var quads int
	for r, n := range counts {
		switch n {
		case 2:
			pairs = append(pairs, r)
		case 3:
			trips = r
		case 4:
			quads = r
		}
	}

	flush := true
	for i := 1; i < 5; i++ {
		if cards[i].Suit != cards[0].Suit {
			flush = false
			break
		}
	}

	straight, high := IsStraight(cards)

	switch {
	case flush && straight && high == 14:
		return Result{StraightFlush, 14}
	case flush && straight:
		return Result{StraightFlush, high}
	case quads != 0:
		return Result{FourOfAKind, quads}
	case trips != 0 && len(pairs) == 1:
		return Result{FullHouse, trips*100 + pairs[0]}
	case flush:
		return Result{Flush, sumHighCards(cards)}
	case straight:
		return Result{Straight, high}
	case trips != 0:
		return Result{ThreeOfAKind, trips}
	case len(pairs) == 2:
		sort.Slice(pairs, func(i, j int) bool { return pairs[i] > pairs[j] })
		return Result{TwoPair, pairs[0]*100 + pairs[1]}
	case len(pairs) == 1:
		return Result{OnePair, pairs[0]}
	default:
		return Result{HighCard, sumHighCards(cards)}
	}
}

func IsStraight(cards [5]internal.Card) (bool, int) {
	ranks := make([]int, 5)
	for i, c := range cards {
		ranks[i] = c.Rank
	}
	sort.Ints(ranks)

	straight := true
	for i := 1; i < 5; i++ {
		if ranks[i] != ranks[i-1]+1 {
			straight = false
			break
		}
	}
	if straight {
		return true, ranks[4]
	}

	if ranks[0] == 2 && ranks[1] == 3 && ranks[2] == 4 && ranks[3] == 5 && ranks[4] == 14 {
		return true, 5
	}
	return false, 0
}

func sumHighCards(cards [5]internal.Card) int {
	ranks := make([]int, 5)
	for i, c := range cards {
		ranks[i] = c.Rank
	}
	sort.Slice(ranks, func(i, j int) bool { return ranks[i] > ranks[j] })
	var s int
	for _, r := range ranks {
		s = s*100 + r
	}
	return s
}

func BestHand(cards []internal.Card) Result {
	n := len(cards)
	best := Result{HighCard, 0}

	comb := make([]int, 5)
	for i := 0; i < 5; i++ {
		comb[i] = i
	}

	for {
		var five [5]internal.Card
		for i, idx := range comb {
			five[i] = cards[idx]
		}
		r := Eval5(five)
		if r.Rank > best.Rank || (r.Rank == best.Rank && r.Score > best.Score) {
			best = r
		}

		i := 4
		for i >= 0 && comb[i] == i+n-5 {
			i--
		}
		if i < 0 {
			break
		}
		comb[i]++
		for j := i + 1; j < 5; j++ {
			comb[j] = comb[j-1] + 1
		}
	}

	return best
}
