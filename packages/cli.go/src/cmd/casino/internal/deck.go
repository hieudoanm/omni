package internal

import "math/rand"

func NewShuffledDeck() []Card {
	d := make([]Card, 52)
	var i int
	for r := 2; r <= 14; r++ {
		for s := 0; s < 4; s++ {
			d[i] = Card{Rank: r, Suit: Suit(s)}
			i++
		}
	}
	rand.Shuffle(len(d), func(i, j int) {
		d[i], d[j] = d[j], d[i]
	})
	return d
}

func DealCard(d *[]Card) Card {
	c := (*d)[0]
	*d = (*d)[1:]
	return c
}

func MinInt(a, b int) int {
	if a < b {
		return a
	}
	return b
}
