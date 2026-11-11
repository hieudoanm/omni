package count

import (
	"encoding/json"
	"fmt"
	"math/rand"
)

type countCard struct {
	Rank  string
	Value int
}

func newCountDeck() []countCard {
	ranks := []string{
		"A", "2", "3", "4", "5", "6",
		"7", "8", "9", "10", "J", "Q", "K",
	}
	deck := make([]countCard, len(ranks))
	for i, r := range ranks {
		deck[i] = countCard{Rank: r, Value: hiLoCountValue(r)}
	}
	rand.Shuffle(len(deck), func(i, j int) {
		deck[i], deck[j] = deck[j], deck[i]
	})
	return deck
}

func hiLoCountValue(rank string) int {
	switch rank {
	case "2", "3", "4", "5", "6":
		return +1
	case "7", "8", "9":
		return 0
	default:
		return -1
	}
}

func runCount(cards int, jsonOutput bool) error {
	deck := newCountDeck()
	count := 0

	limit := cards
	if limit > len(deck) {
		limit = len(deck)
	}

	type cardResult struct {
		Rank  string `json:"rank"`
		Value int    `json:"value"`
	}
	var cardResults []cardResult

	for i := 0; i < limit; i++ {
		c := deck[i]
		count += c.Value
		cardResults = append(cardResults, cardResult{Rank: c.Rank, Value: c.Value})
	}

	if jsonOutput {
		b, _ := json.MarshalIndent(map[string]interface{}{
			"cards":       cardResults,
			"final_count": count,
		}, "", "  ")
		fmt.Println(string(b))
	} else {
		for i, cr := range cardResults {
			fmt.Printf("Card %2d/%d: %s  (running count: %+d)\n", i+1, limit, cr.Rank, cr.Value)
		}
		fmt.Printf("\nFinal running count: %+d\n", count)
	}
	return nil
}
