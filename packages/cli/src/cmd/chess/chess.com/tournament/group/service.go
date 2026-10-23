package group

import (
	"encoding/json"
	"fmt"

	"github.com/spf13/cobra"

	"github.com/hieudoanm/omni/packages/cli/src/libs/requests"
)

type RoundGroup struct {
	FairPlayRemovals []string      `json:"fair_play_removals"`
	Games            []GroupGame   `json:"games"`
	Players          []GroupPlayer `json:"players"`
}

type GroupGame struct {
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
	ECO          string `json:"eco"`
	Tournament   string `json:"tournament"`
}

type GroupPlayer struct {
	Username    string `json:"username"`
	Points      int    `json:"points"`
	TieBreak    int    `json:"tie_break"`
	IsAdvancing bool   `json:"is_advancing"`
}

func runTournamentGroup(cmd *cobra.Command, args []string) error {
	tournamentID, _ := cmd.Flags().GetString("tournament")
	roundNum, _ := cmd.Flags().GetInt("round")
	groupNum, _ := cmd.Flags().GetInt("group")
	jsonOutput, _ := cmd.Flags().GetBool("json")
	url := fmt.Sprintf("https://api.chess.com/pub/tournament/%s/%d/%d", tournamentID, roundNum, groupNum)
	body, err := requests.Get(url, requests.Options{})
	if err != nil {
		return fmt.Errorf("failed to fetch group: %w", err)
	}
	var g RoundGroup
	if err := json.Unmarshal(body, &g); err != nil {
		return fmt.Errorf("failed to parse group: %w", err)
	}
	if jsonOutput {
		b, _ := json.MarshalIndent(g, "", "  ")
		fmt.Println(string(b))
		return nil
	}
	fmt.Printf("Group %d (round %d): %d games, %d players\n", groupNum, roundNum, len(g.Games), len(g.Players))
	return nil
}
