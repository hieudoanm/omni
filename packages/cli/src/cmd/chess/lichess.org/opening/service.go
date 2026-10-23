package opening

import (
	"encoding/json"
	"fmt"

	"github.com/hieudoanm/omni/packages/cli/src/libs/requests"
	"github.com/spf13/cobra"
)

type OpeningStats struct {
	Opening *struct {
		Eco  string `json:"eco"`
		Name string `json:"name"`
	} `json:"opening,omitempty"`
	White int `json:"white"`
	Draws int `json:"draws"`
	Black int `json:"black"`
	Moves []struct {
		San   string `json:"san"`
		Uci   string `json:"uci"`
		White int    `json:"white"`
		Draws int    `json:"draws"`
		Black int    `json:"black"`
	} `json:"moves"`
}

func runOpening(cmd *cobra.Command, args []string) error {
	jsonOut, _ := cmd.Flags().GetBool("json")
	fen := args[0]

	body, err := requests.Get(
		"https://explorer.lichess.org/masters",
		requests.Options{Query: map[string]string{"fen": fen}},
	)
	if err != nil {
		return fmt.Errorf("failed to fetch opening stats: %w", err)
	}

	var stats OpeningStats
	if err := json.Unmarshal(body, &stats); err != nil {
		return fmt.Errorf("failed to parse opening stats: %w", err)
	}

	if jsonOut {
		b, _ := json.MarshalIndent(stats, "", "  ")
		fmt.Println(string(b))
		return nil
	}

	fmt.Println()
	fmt.Println("♞ Masters Opening Explorer")
	fmt.Println("------------------------------------------------")

	if stats.Opening != nil && stats.Opening.Name != "" {
		fmt.Printf("Opening : %s (%s)\n", stats.Opening.Name, stats.Opening.Eco)
	}

	total := stats.White + stats.Draws + stats.Black
	fmt.Printf("Games   : %d\n", total)
	fmt.Printf("Results : %dW / %dD / %dB (%.1f%% / %.1f%% / %.1f%%)\n",
		stats.White, stats.Draws, stats.Black,
		float64(stats.White)/float64(total)*100,
		float64(stats.Draws)/float64(total)*100,
		float64(stats.Black)/float64(total)*100,
	)

	fmt.Println()
	fmt.Printf("%-8s %-10s %-10s %-6s\n", "Move", "White", "Draw", "Black")
	fmt.Println("-------- ---------- ---------- ------")
	for _, m := range stats.Moves {
		if m.White == 0 && m.Black == 0 {
			continue
		}
		mTotal := m.White + m.Draws + m.Black
		fmt.Printf("%-8s %5d(%4.1f%%) %5d(%4.1f%%) %5d(%4.1f%%)\n",
			m.San,
			m.White, float64(m.White)/float64(mTotal)*100,
			m.Draws, float64(m.Draws)/float64(mTotal)*100,
			m.Black, float64(m.Black)/float64(mTotal)*100,
		)
	}

	return nil
}
