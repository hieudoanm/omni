package archive

import (
	"encoding/json"
	"fmt"
	"strconv"
	"strings"

	"github.com/spf13/cobra"

	"github.com/hieudoanm/omni/packages/cli/src/libs/requests"
)

type ArchiveGamesResponse struct {
	Games []ArchiveGame `json:"games"`
}

type ArchiveGamePlayer struct {
	Username string `json:"username"`
	Rating   int    `json:"rating"`
	Result   string `json:"result"`
	ID       string `json:"@id"`
}

type ArchiveGame struct {
	White       ArchiveGamePlayer  `json:"white"`
	Black       ArchiveGamePlayer  `json:"black"`
	Accuracies  map[string]float64 `json:"accuracies"`
	URL         string             `json:"url"`
	FEN         string             `json:"fen"`
	PGN         string             `json:"pgn"`
	StartTime   int64              `json:"start_time"`
	EndTime     int64              `json:"end_time"`
	TimeControl string             `json:"time_control"`
	Rules       string             `json:"rules"`
	ECO         string             `json:"eco"`
	Tournament  string             `json:"tournament"`
	Match       string             `json:"match"`
}

func runArchive(cmd *cobra.Command, args []string) error {
	username, _ := cmd.Flags().GetString("username")
	year, _ := cmd.Flags().GetString("year")
	month, _ := cmd.Flags().GetString("month")
	jsonOutput, _ := cmd.Flags().GetBool("json")
	url := fmt.Sprintf("https://api.chess.com/pub/player/%s/games/%s/%s", strings.ToLower(username), year, month)
	body, err := requests.Get(url, requests.Options{})
	if err != nil {
		return fmt.Errorf("failed to fetch archive: %w", err)
	}
	var resp ArchiveGamesResponse
	if err := json.Unmarshal(body, &resp); err != nil {
		return fmt.Errorf("failed to parse archive: %w", err)
	}
	if jsonOutput {
		b, _ := json.MarshalIndent(resp, "", "  ")
		fmt.Println(string(b))
		return nil
	}
	if len(resp.Games) == 0 {
		fmt.Println("No games found")
		return nil
	}
	y, _ := strconv.Atoi(year)
	m, _ := strconv.Atoi(month)
	fmt.Printf("Games from %d/%d for %s:\n", y, m, username)
	for _, g := range resp.Games {
		fmt.Printf("  %s (%d) vs %s (%d) | %s | %s\n",
			g.White.Username, g.White.Rating,
			g.Black.Username, g.Black.Rating,
			g.TimeControl, g.Rules)
	}
	return nil
}
