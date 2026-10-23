package internal

type Suit int

const (
	Clubs Suit = iota
	Diamonds
	Hearts
	Spades
)

type Card struct {
	Rank int
	Suit Suit
}

func (c Card) String() string {
	r := "23456789TJQKA"[c.Rank-2 : c.Rank-1]
	s := "cdhs"[c.Suit : c.Suit+1]
	return string(r) + string(s)
}

func ParseCard(s string) Card {
	var rank int
	switch s[0] {
	case '2', '3', '4', '5', '6', '7', '8', '9':
		rank = int(s[0] - '0')
	case 'T':
		rank = 10
	case 'J':
		rank = 11
	case 'Q':
		rank = 12
	case 'K':
		rank = 13
	case 'A':
		rank = 14
	}
	var suit int
	switch s[1] {
	case 'd':
		suit = 1
	case 'h':
		suit = 2
	case 's':
		suit = 3
	}
	return Card{Rank: rank, Suit: Suit(suit)}
}
