package round

import (
	"encoding/json"
	"fmt"

	"github.com/spf13/cobra"

	"github.com/hieudoanm/omni/packages/cli/src/libs/requests"
)

type TournamentRound struct {
	Groups  []string      `json:"groups"`
	Players []RoundPlayer `json:"players"`
}

type RoundPlayer struct {
	Username    string `json:"username"`
	IsAdvancing bool   `json:"is_advancing"`
}

func runTournamentRound(cmd *cobra.Command, args []string) error {
	tournamentID, _ := cmd.Flags().GetString("tournament")
	roundNum, _ := cmd.Flags().GetInt("round")
	jsonOutput, _ := cmd.Flags().GetBool("json")
	url := fmt.Sprintf("https://api.chess.com/pub/tournament/%s/%d", tournamentID, roundNum)
	body, err := requests.Get(url, requests.Options{})
	if err != nil {
		return fmt.Errorf("failed to fetch round: %w", err)
	}
	var r TournamentRound
	if err := json.Unmarshal(body, &r); err != nil {
		return fmt.Errorf("failed to parse round: %w", err)
	}
	if jsonOutput {
		b, _ := json.MarshalIndent(r, "", "  ")
		fmt.Println(string(b))
		return nil
	}
	fmt.Printf("Round %d: %d groups, %d players\n", roundNum, len(r.Groups), len(r.Players))
	return nil
}
