package stats

import (
	"encoding/json"
	"fmt"
	"strings"

	"github.com/spf13/cobra"

	"github.com/hieudoanm/omni/packages/cli/src/libs/number"
	"github.com/hieudoanm/omni/packages/cli/src/libs/requests"
)

type StatsLast struct {
	Date   int `json:"date"`
	Rating int `json:"rating"`
	Rd     int `json:"rd"`
}

type StatsBest struct {
	Date   int    `json:"date"`
	Rating int    `json:"rating"`
	Game   string `json:"game"`
}

type StatsRecord struct {
	Win            int     `json:"win"`
	Loss           int     `json:"loss"`
	Draw           int     `json:"draw"`
	TimePerMove    int     `json:"time_per_move"`
	TimeoutPercent float64 `json:"timeout_percent"`
}

type GameStats struct {
	Last   StatsLast   `json:"last"`
	Best   StatsBest   `json:"best"`
	Record StatsRecord `json:"record"`
}

type TacticsStats struct {
	Highest StatsRating `json:"highest"`
	Lowest  StatsRating `json:"lowest"`
}

type StatsRating struct {
	Rating int `json:"rating"`
	Date   int `json:"date"`
}

type PuzzleRushScore struct {
	TotalAttempts int `json:"total_attempts"`
	Score         int `json:"score"`
}

type PuzzleRushStats struct {
	Daily PuzzleRushScore `json:"daily"`
	Best  PuzzleRushScore `json:"best"`
}

func runPlayerStats(cmd *cobra.Command, args []string) error {
	username, _ := cmd.Flags().GetString("username")
	jsonOutput, _ := cmd.Flags().GetBool("json")
	url := fmt.Sprintf("https://api.chess.com/pub/player/%s/stats", strings.ToLower(username))
	body, err := requests.Get(url, requests.Options{})
	if err != nil {
		return fmt.Errorf("failed to fetch stats: %w", err)
	}
	var raw map[string]json.RawMessage
	if err := json.Unmarshal(body, &raw); err != nil {
		return fmt.Errorf("failed to parse stats: %w", err)
	}
	if jsonOutput {
		b, _ := json.MarshalIndent(raw, "", "  ")
		fmt.Println(string(b))
		return nil
	}
	gameTypes := []string{"chess_bullet", "chess_blitz", "chess_rapid", "chess_daily", "chess960_daily"}
	fmt.Println()
	fmt.Println("Ratings")
	fmt.Println()
	fmt.Printf("| %-14s | %8s | %8s | %8s | %8s | %8s |\n", "Game Type", "Rating", "Best", "Win", "Draw", "Loss")
	fmt.Printf("| %-14s | %8s | %8s | %8s | %8s | %8s |\n", strings.Repeat("-", 14), strings.Repeat("-", 8), strings.Repeat("-", 8), strings.Repeat("-", 8), strings.Repeat("-", 8), strings.Repeat("-", 8))
	for _, gt := range gameTypes {
		if data, ok := raw[gt]; ok {
			var gs GameStats
			if err := json.Unmarshal(data, &gs); err == nil {
				fmt.Printf("| %-14s | %8d | %8d | %8s | %8s | %8s |\n",
					gt, gs.Last.Rating, gs.Best.Rating,
					number.Comma(gs.Record.Win),
					number.Comma(gs.Record.Draw),
					number.Comma(gs.Record.Loss))
			}
		}
	}
	if tactics, ok := raw["tactics"]; ok {
		var ts TacticsStats
		if err := json.Unmarshal(tactics, &ts); err == nil {
			fmt.Println()
			fmt.Printf("Tactics  : best %d, lowest %d\n", ts.Highest.Rating, ts.Lowest.Rating)
		}
	}
	if pr, ok := raw["puzzle_rush"]; ok {
		var ps PuzzleRushStats
		if err := json.Unmarshal(pr, &ps); err == nil {
			fmt.Println()
			fmt.Printf("Puzzle Rush: best %d, daily best %d\n", ps.Best.Score, ps.Daily.Score)
		}
	}
	return nil
}
