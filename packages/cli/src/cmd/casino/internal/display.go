package internal

import "strings"

func CardDisplay(c Card) string {
	r := "23456789TJQKA"[c.Rank-2 : c.Rank-1]
	var s string
	switch c.Suit {
	case Clubs:
		s = "♣"
	case Diamonds:
		s = "♦"
	case Hearts:
		s = "♥"
	case Spades:
		s = "♠"
	}
	return "[" + string(r) + s + "]"
}

func CardsDisplay(cards []Card) string {
	var sb strings.Builder
	for _, c := range cards {
		sb.WriteString(CardDisplay(c))
		sb.WriteString(" ")
	}
	return strings.TrimSpace(sb.String())
}
