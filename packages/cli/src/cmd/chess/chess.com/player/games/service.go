package games

import (
	"encoding/json"
	"fmt"
	"strings"

	"github.com/spf13/cobra"

	"github.com/hieudoanm/omni/packages/cli/src/libs/requests"
)

type GamesResponse struct {
	Games []Game `json:"games"`
}

type Game struct {
	White        string `json:"white"`
	Black        string `json:"black"`
	URL          string `json:"url"`
	FEN          string `json:"fen"`
	PGN          string `json:"pgn"`
	Turn         string `json:"turn"`
	MoveBy       int64  `json:"move_by"`
	DrawOffer    string `json:"draw_offer"`
	LastActivity int64  `json:"last_activity"`
	StartTime    int64  `json:"start_time"`
	TimeControl  string `json:"time_control"`
	TimeClass    string `json:"time_class"`
	Rules        string `json:"rules"`
	Tournament   string `json:"tournament"`
	Match        string `json:"match"`
}

func runPlayerGames(cmd *cobra.Command, args []string) error {
	username, _ := cmd.Flags().GetString("username")
	jsonOutput, _ := cmd.Flags().GetBool("json")
	url := fmt.Sprintf("https://api.chess.com/pub/player/%s/games", strings.ToLower(username))
	body, err := requests.Get(url, requests.Options{})
	if err != nil {
		return fmt.Errorf("failed to fetch games: %w", err)
	}
	var resp GamesResponse
	if err := json.Unmarshal(body, &resp); err != nil {
		return fmt.Errorf("failed to parse games: %w", err)
	}
	if jsonOutput {
		b, _ := json.MarshalIndent(resp, "", "  ")
		fmt.Println(string(b))
		return nil
	}
	if len(resp.Games) == 0 {
		fmt.Println("No current games")
		return nil
	}
	fmt.Println()
	fmt.Printf("Current games for %s:\n", username)
	fmt.Println()
	for _, g := range resp.Games {
		fmt.Printf("  %s vs %s | %s | %s\n", g.White, g.Black, g.TimeClass, g.Rules)
	}
	return nil
}
