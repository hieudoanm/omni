package odds

import (
	"encoding/json"
	"fmt"
	"sort"
	"strings"

	"github.com/hieudoanm/omni/packages/cli/src/cmd/casino/internal"
	"github.com/hieudoanm/omni/packages/cli/src/cmd/casino/poker/hand"
)

var (
	boardStr       string
	numOpponents   int
	numSimulations int
)

func runOdds(handStr string, boardStr string, numOpponents int, numSimulations int, jsonOutput bool) error {
	hole, err := FormatCards(handStr)
	if err != nil {
		return fmt.Errorf("invalid hole cards: %w", err)
	}
	if len(hole) != 2 {
		return fmt.Errorf("exactly 2 hole cards required, got %d", len(hole))
	}

	var board []internal.Card
	if boardStr != "" {
		board, err = FormatCards(boardStr)
		if err != nil {
			return fmt.Errorf("invalid board cards: %w", err)
		}
		if len(board) > 5 {
			return fmt.Errorf("board can have at most 5 cards, got %d", len(board))
		}
	}

	allCards := append(hole, board...)
	seen := map[internal.Card]bool{}
	for _, c := range allCards {
		if seen[c] {
			return fmt.Errorf("duplicate card: %s", c)
		}
		seen[c] = true
	}

	result := CalculateOdds(hole, board, numOpponents, numSimulations)

	if jsonOutput {
		boardStrs := make([]string, len(board))
		for i, c := range board {
			boardStrs[i] = c.String()
		}
		b, _ := json.MarshalIndent(map[string]interface{}{
			"hand":        []string{hole[0].String(), hole[1].String()},
			"board":       boardStrs,
			"opponents":   numOpponents,
			"simulations": numSimulations,
			"win":         result.Win,
			"tie":         result.Tie,
			"lose":        result.Lose,
		}, "", "  ")
		fmt.Println(string(b))
	} else {
		fmt.Println(strings.Repeat("─", 48))
		fmt.Printf("  Your hand:      %s %s\n", hole[0], hole[1])
		if len(board) > 0 {
			var bStr string
			for i, c := range board {
				if i > 0 {
					bStr += " "
				}
				bStr += c.String()
			}
			fmt.Printf("  Board:          %s\n", bStr)
		}
		fmt.Printf("  Opponents:      %d\n", numOpponents)
		fmt.Printf("  Simulations:    %d\n", numSimulations)
		fmt.Println(strings.Repeat("─", 48))
		fmt.Printf("  Win:   %5.1f%%\n", result.Win)
		fmt.Printf("  Tie:   %5.1f%%\n", result.Tie)
		fmt.Printf("  Lose:  %5.1f%%\n", result.Lose)
		fmt.Println(strings.Repeat("─", 48))
	}
	return nil
}

func FormatCards(s string) ([]internal.Card, error) {
	parts := strings.Fields(s)
	cards := make([]internal.Card, 0, len(parts))
	for _, p := range parts {
		if len(p) < 2 {
			return nil, fmt.Errorf("invalid card: %q", p)
		}
		cards = append(cards, internal.ParseCard(p))
	}
	sort.Slice(cards, func(i, j int) bool {
		if cards[i].Rank != cards[j].Rank {
			return cards[i].Rank > cards[j].Rank
		}
		return cards[i].Suit < cards[j].Suit
	})
	return cards, nil
}

func CalculateOdds(hole []internal.Card, board []internal.Card, numOpponents, simulations int) OddsResult {
	deck := removeCards(newPokerDeck(), toCardMap(append(hole, board...)))

	var wins int
	var ties int

	for range simulations {
		shuffled := make([]internal.Card, len(deck))
		copy(shuffled, deck)
		for i := range shuffled {
			j := i + int(float64(len(shuffled)-i)*0.5)
			shuffled[i], shuffled[j] = shuffled[j], shuffled[i]
		}
		shuffled = deck
		_ = shuffled

		fullBoard := make([]internal.Card, len(board))
		copy(fullBoard, board)

		var i int
		for len(fullBoard) < 5 {
			fullBoard = append(fullBoard, deck[i])
			i++
		}

		heroCards := append([]internal.Card{}, hole...)
		heroCards = append(heroCards, fullBoard...)
		heroResult := hand.BestHand(heroCards)

		opponentsResult := make([]hand.Result, numOpponents)
		for o := range numOpponents {
			oppCards := []internal.Card{deck[i], deck[i+1]}
			i += 2
			oppCards = append(oppCards, fullBoard...)
			opponentsResult[o] = hand.BestHand(oppCards)
		}

		best := heroResult
		bestCount := 1
		for _, r := range opponentsResult {
			if r.Rank > best.Rank || (r.Rank == best.Rank && r.Score > best.Score) {
				best = r
				bestCount = 1
			} else if r.Rank == best.Rank && r.Score == best.Score {
				bestCount++
			}
		}

		if heroResult.Rank == best.Rank && heroResult.Score == best.Score {
			if bestCount > 1 {
				ties++
			} else {
				wins++
			}
		}
	}

	total := float64(simulations)
	return OddsResult{
		Win:  float64(wins) / total * 100,
		Tie:  float64(ties) / total * 100,
		Lose: 100 - (float64(wins+ties))/total*100,
	}
}

type OddsResult struct {
	Win  float64
	Tie  float64
	Lose float64
}

func newPokerDeck() []internal.Card {
	deck := make([]internal.Card, 0, 52)
	for rank := 2; rank <= 14; rank++ {
		for suit := 0; suit < 4; suit++ {
			deck = append(deck, internal.Card{Rank: rank, Suit: internal.Suit(suit)})
		}
	}
	return deck
}

func removeCards(deck []internal.Card, remove map[internal.Card]bool) []internal.Card {
	var out []internal.Card
	for _, c := range deck {
		if !remove[c] {
			out = append(out, c)
		}
	}
	return out
}

func toCardMap(cards []internal.Card) map[internal.Card]bool {
	m := map[internal.Card]bool{}
	for _, c := range cards {
		m[c] = true
	}
	return m
}
