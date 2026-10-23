package hand

import (
	"testing"

	"github.com/hieudoanm/omni/packages/cli/src/cmd/casino/internal"
)

func TestIsStraight(t *testing.T) {
	tests := []struct {
		name     string
		cards    [5]internal.Card
		wantOk   bool
		wantHigh int
	}{
		{
			name:     "normal straight",
			cards:    [5]internal.Card{{Rank: 5, Suit: internal.Clubs}, {Rank: 6, Suit: internal.Diamonds}, {Rank: 7, Suit: internal.Hearts}, {Rank: 8, Suit: internal.Spades}, {Rank: 9, Suit: internal.Clubs}},
			wantOk:   true,
			wantHigh: 9,
		},
		{
			name:     "wheel",
			cards:    [5]internal.Card{{Rank: 14, Suit: internal.Clubs}, {Rank: 2, Suit: internal.Diamonds}, {Rank: 3, Suit: internal.Hearts}, {Rank: 4, Suit: internal.Spades}, {Rank: 5, Suit: internal.Clubs}},
			wantOk:   true,
			wantHigh: 5,
		},
		{
			name:     "not a straight",
			cards:    [5]internal.Card{{Rank: 2, Suit: internal.Clubs}, {Rank: 5, Suit: internal.Diamonds}, {Rank: 7, Suit: internal.Hearts}, {Rank: 9, Suit: internal.Spades}, {Rank: 13, Suit: internal.Clubs}},
			wantOk:   false,
			wantHigh: 0,
		},
	}
	for _, tt := range tests {
		gotOk, gotHigh := IsStraight(tt.cards)
		if gotOk != tt.wantOk || gotHigh != tt.wantHigh {
			t.Errorf("%s: IsStraight(%+v) = (%v, %d), want (%v, %d)",
				tt.name, tt.cards, gotOk, gotHigh, tt.wantOk, tt.wantHigh)
		}
	}
}

func TestSumHighCards(t *testing.T) {
	cards := [5]internal.Card{{Rank: 2, Suit: internal.Clubs}, {Rank: 5, Suit: internal.Diamonds}, {Rank: 7, Suit: internal.Hearts}, {Rank: 9, Suit: internal.Spades}, {Rank: 13, Suit: internal.Clubs}}
	got := sumHighCards(cards)
	want := ((((0*100+13)*100+9)*100+7)*100+5)*100 + 2
	if got != want {
		t.Errorf("sumHighCards(%+v) = %d, want %d", cards, got, want)
	}
}

func eval5Helper(ranks []int, suits []internal.Suit) [5]internal.Card {
	var cards [5]internal.Card
	for i := range 5 {
		cards[i] = internal.Card{Rank: ranks[i], Suit: suits[i]}
	}
	return cards
}

func TestEval5HighCard(t *testing.T) {
	cards := eval5Helper([]int{2, 5, 7, 9, 13}, []internal.Suit{internal.Clubs, internal.Diamonds, internal.Hearts, internal.Spades, internal.Clubs})
	r := Eval5(cards)
	if r.Rank != HighCard {
		t.Errorf("expected HighCard, got %v", r.Rank)
	}
	wantScore := sumHighCards(cards)
	if r.Score != wantScore {
		t.Errorf("score = %d, want %d", r.Score, wantScore)
	}
}

func TestEval5OnePair(t *testing.T) {
	cards := eval5Helper([]int{2, 2, 7, 9, 13}, []internal.Suit{internal.Clubs, internal.Diamonds, internal.Hearts, internal.Spades, internal.Clubs})
	r := Eval5(cards)
	if r.Rank != OnePair {
		t.Errorf("expected OnePair, got %v", r.Rank)
	}
	if r.Score != 2 {
		t.Errorf("score = %d, want 2", r.Score)
	}
}

func TestEval5TwoPair(t *testing.T) {
	cards := eval5Helper([]int{2, 2, 7, 7, 13}, []internal.Suit{internal.Clubs, internal.Diamonds, internal.Hearts, internal.Spades, internal.Clubs})
	r := Eval5(cards)
	if r.Rank != TwoPair {
		t.Errorf("expected TwoPair, got %v", r.Rank)
	}
	if r.Score != 702 {
		t.Errorf("score = %d, want 702", r.Score)
	}
}

func TestEval5ThreeOfAKind(t *testing.T) {
	cards := eval5Helper([]int{2, 2, 2, 7, 13}, []internal.Suit{internal.Clubs, internal.Diamonds, internal.Hearts, internal.Spades, internal.Clubs})
	r := Eval5(cards)
	if r.Rank != ThreeOfAKind {
		t.Errorf("expected ThreeOfAKind, got %v", r.Rank)
	}
	if r.Score != 2 {
		t.Errorf("score = %d, want 2", r.Score)
	}
}

func TestEval5Straight(t *testing.T) {
	cards := eval5Helper([]int{5, 6, 7, 8, 9}, []internal.Suit{internal.Clubs, internal.Diamonds, internal.Hearts, internal.Spades, internal.Clubs})
	r := Eval5(cards)
	if r.Rank != Straight {
		t.Errorf("expected Straight, got %v", r.Rank)
	}
	if r.Score != 9 {
		t.Errorf("score = %d, want 9", r.Score)
	}
}

func TestEval5Flush(t *testing.T) {
	cards := eval5Helper([]int{2, 5, 7, 9, 13}, []internal.Suit{internal.Clubs, internal.Clubs, internal.Clubs, internal.Clubs, internal.Clubs})
	r := Eval5(cards)
	if r.Rank != Flush {
		t.Errorf("expected Flush, got %v", r.Rank)
	}
	wantScore := sumHighCards(cards)
	if r.Score != wantScore {
		t.Errorf("score = %d, want %d", r.Score, wantScore)
	}
}

func TestEval5FullHouse(t *testing.T) {
	cards := eval5Helper([]int{2, 2, 2, 7, 7}, []internal.Suit{internal.Clubs, internal.Diamonds, internal.Hearts, internal.Spades, internal.Clubs})
	r := Eval5(cards)
	if r.Rank != FullHouse {
		t.Errorf("expected FullHouse, got %v", r.Rank)
	}
	if r.Score != 2*100+7 {
		t.Errorf("score = %d, want %d", r.Score, 2*100+7)
	}
}

func TestEval5FourOfAKind(t *testing.T) {
	cards := eval5Helper([]int{2, 2, 2, 2, 13}, []internal.Suit{internal.Clubs, internal.Diamonds, internal.Hearts, internal.Spades, internal.Clubs})
	r := Eval5(cards)
	if r.Rank != FourOfAKind {
		t.Errorf("expected FourOfAKind, got %v", r.Rank)
	}
	if r.Score != 2 {
		t.Errorf("score = %d, want 2", r.Score)
	}
}

func TestEval5StraightFlush(t *testing.T) {
	cards := eval5Helper([]int{5, 6, 7, 8, 9}, []internal.Suit{internal.Clubs, internal.Clubs, internal.Clubs, internal.Clubs, internal.Clubs})
	r := Eval5(cards)
	if r.Rank != StraightFlush {
		t.Errorf("expected StraightFlush, got %v", r.Rank)
	}
	if r.Score != 9 {
		t.Errorf("score = %d, want 9", r.Score)
	}
}

func TestEval5RoyalFlush(t *testing.T) {
	cards := eval5Helper([]int{10, 11, 12, 13, 14}, []internal.Suit{internal.Clubs, internal.Clubs, internal.Clubs, internal.Clubs, internal.Clubs})
	r := Eval5(cards)
	if r.Rank != StraightFlush {
		t.Errorf("expected StraightFlush, got %v", r.Rank)
	}
	if r.Score != 14 {
		t.Errorf("score = %d, want 14 (royal)", r.Score)
	}
}

func TestIsStraightWheel(t *testing.T) {
	cards := eval5Helper([]int{14, 2, 3, 4, 5}, []internal.Suit{internal.Clubs, internal.Diamonds, internal.Hearts, internal.Spades, internal.Clubs})
	ok, high := IsStraight(cards)
	if !ok {
		t.Error("IsStraight: expected true for wheel")
	}
	if high != 5 {
		t.Errorf("IsStraight: high = %d, want 5 for wheel", high)
	}
}

func TestBestHand5Cards(t *testing.T) {
	cards := []internal.Card{{Rank: 2, Suit: internal.Clubs}, {Rank: 2, Suit: internal.Diamonds}, {Rank: 7, Suit: internal.Hearts}, {Rank: 9, Suit: internal.Spades}, {Rank: 13, Suit: internal.Clubs}}
	r := BestHand(cards)
	if r.Rank != OnePair {
		t.Errorf("expected OnePair from 5 cards, got %v", r.Rank)
	}
}

func TestBestHand6Cards(t *testing.T) {
	cards := []internal.Card{
		{Rank: 2, Suit: internal.Clubs}, {Rank: 2, Suit: internal.Diamonds}, {Rank: 2, Suit: internal.Hearts},
		{Rank: 7, Suit: internal.Spades}, {Rank: 7, Suit: internal.Clubs}, {Rank: 13, Suit: internal.Diamonds},
	}
	r := BestHand(cards)
	if r.Rank != FullHouse {
		t.Errorf("expected FullHouse from 6 cards, got %v", r.Rank)
	}
}

func TestBestHand7Cards(t *testing.T) {
	cards := []internal.Card{
		{Rank: 2, Suit: internal.Clubs}, {Rank: 3, Suit: internal.Clubs}, {Rank: 4, Suit: internal.Clubs}, {Rank: 5, Suit: internal.Clubs},
		{Rank: 6, Suit: internal.Diamonds}, {Rank: 9, Suit: internal.Hearts}, {Rank: 13, Suit: internal.Spades},
	}
	r := BestHand(cards)
	if r.Rank != Straight {
		t.Errorf("expected Straight from 7 cards, got %v", r.Rank)
	}
}
