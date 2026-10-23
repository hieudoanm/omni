package daily

import (
	"encoding/json"
	"fmt"

	"github.com/hieudoanm/omni/packages/cli/src/libs/requests"
	"github.com/spf13/cobra"
)

type PuzzleAndGame struct {
	Game struct {
		ID   string `json:"id"`
		Perf struct {
			Key  string `json:"key"`
			Name string `json:"name"`
		} `json:"perf"`
		Pgn     string `json:"pgn"`
		Rated   bool   `json:"rated"`
		Players []struct {
			Color  string  `json:"color"`
			Name   string  `json:"name"`
			Rating int     `json:"rating"`
			Title  *string `json:"title,omitempty"`
		} `json:"players"`
	} `json:"game"`
	Puzzle struct {
		ID       string   `json:"id"`
		Rating   int      `json:"rating"`
		Plays    int      `json:"plays"`
		Fen      string   `json:"fen"`
		LastMove string   `json:"lastMove"`
		Solution []string `json:"solution"`
		Themes   []string `json:"themes"`
	} `json:"puzzle"`
}

func runDaily(cmd *cobra.Command, args []string) error {
	jsonOut, _ := cmd.Flags().GetBool("json")

	body, err := requests.Get("https://lichess.org/api/puzzle/daily", requests.Options{})
	if err != nil {
		return fmt.Errorf("failed to fetch daily puzzle: %w", err)
	}

	var data PuzzleAndGame
	if err := json.Unmarshal(body, &data); err != nil {
		return fmt.Errorf("failed to parse puzzle: %w", err)
	}

	if jsonOut {
		b, _ := json.MarshalIndent(data, "", "  ")
		fmt.Println(string(b))
		return nil
	}

	fmt.Println()
	fmt.Println("♞ Lichess Daily Puzzle")
	fmt.Println("------------------------------------------------")
	fmt.Printf("Puzzle  : %s\n", data.Puzzle.ID)
	fmt.Printf("Rating  : %d (played %d times)\n", data.Puzzle.Rating, data.Puzzle.Plays)
	fmt.Printf("Themes  : %v\n", data.Puzzle.Themes)
	fmt.Printf("FEN     : %s\n", data.Puzzle.Fen)
	fmt.Printf("Moves   : %v\n", data.Puzzle.Solution)

	g := data.Game
	fmt.Println()
	fmt.Printf("Game    : %s (%s %s)\n", g.ID, g.Perf.Name, map[bool]string{true: "rated", false: "casual"}[g.Rated])
	for _, p := range g.Players {
		title := ""
		if p.Title != nil {
			title = " " + *p.Title
		}
		fmt.Printf("  %s: %s%s (%d)\n", p.Color, p.Name, title, p.Rating)
	}

	return nil
}
