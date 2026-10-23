package strategy

import (
	"encoding/json"
	"fmt"

	"github.com/hieudoanm/omni/packages/cli/src/cmd/casino/baccarat/rules"
	"github.com/hieudoanm/omni/packages/cli/src/cmd/casino/internal"
)

func baccaratSimHand(d []internal.Card) (playerVal, bankerVal int) {
	player := []internal.Card{d[0], d[1]}
	banker := []internal.Card{d[2], d[3]}
	d = d[4:]

	pv := rules.HandSum(player)
	bv := rules.HandSum(banker)

	if pv >= 8 || bv >= 8 {
		return pv, bv
	}

	if rules.ShouldDraw(player) {
		player = append(player, d[0])
		d = d[1:]
		pv = rules.HandSum(player)
		pc := player[2]
		pVal := rules.CardValue(pc)
		if rules.DrawForThird(banker, pVal) {
			banker = append(banker, d[0])
			d = d[1:]
			bv = rules.HandSum(banker)
		}
	} else {
		if rules.ShouldDraw(banker) {
			banker = append(banker, d[0])
			d = d[1:]
			bv = rules.HandSum(banker)
		}
	}

	return rules.HandSum(player), rules.HandSum(banker)
}

func repeat(s string, n int) string {
	b := make([]byte, n)
	for i := range b {
		b[i] = s[0]
	}
	return string(b)
}

func runStrategy(sims int, jsonOutput bool) error {
	var pWins int
	var bWins int
	var ties int

	for range sims {
		deck := internal.NewShuffledDeck()
		pv, bv := baccaratSimHand(deck)
		switch {
		case pv > bv:
			pWins++
		case bv > pv:
			bWins++
		default:
			ties++
		}
	}

	total := float64(sims)
	pPct := float64(pWins) / total * 100
	bPct := float64(bWins) / total * 100
	tPct := float64(ties) / total * 100

	if jsonOutput {
		b, _ := json.MarshalIndent(map[string]interface{}{
			"simulations": sims,
			"player": map[string]interface{}{
				"wins":       pWins,
				"pct":        pPct,
				"payout":     "1:1",
				"house_edge": 2*pPct + tPct - 100,
			},
			"banker": map[string]interface{}{
				"wins":       bWins,
				"pct":        bPct,
				"payout":     "0.95:1",
				"house_edge": 1.95*bPct + tPct - 100,
			},
			"tie": map[string]interface{}{
				"wins":       ties,
				"pct":        tPct,
				"payout":     "8:1",
				"house_edge": 9*tPct - 100,
			},
		}, "", "  ")
		fmt.Println(string(b))
	} else {
		fmt.Println("  Baccarat Strategy Analysis")
		fmt.Println("  " + repeat("-", 38))

		out := func(label string, pct float64, payout string, edge float64) {
			fmt.Printf("  %-10s %6.2f%%   %-6s   %+.2f%%\n", label, pct, payout, edge)
		}
		out("Player", pPct, "1:1", 2*pPct+tPct-100)
		out("Banker", bPct, "0.95:1", 1.95*bPct+tPct-100)
		out("Tie", tPct, "8:1", 9*tPct-100)

		fmt.Println("  " + repeat("-", 38))
		fmt.Printf("  Simulations: %d\n", sims)
		fmt.Println()
		fmt.Println("  Optimal strategy: bet Banker (lowest house edge)")
		fmt.Println("  Avoid Tie bet (high house edge ~14%)")
		fmt.Println("  Banker bets pay 1:1 minus 5% commission")
	}

	return nil
}
