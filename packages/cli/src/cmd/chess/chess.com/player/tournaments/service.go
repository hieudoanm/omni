package tournaments

import (
	"encoding/json"
	"fmt"
	"strings"

	"github.com/spf13/cobra"

	"github.com/hieudoanm/omni/packages/cli/src/libs/requests"
)

type PlayerTournamentsResponse struct {
	Finished   []PlayerTournament `json:"finished"`
	InProgress []PlayerTournament `json:"in_progress"`
	Registered []PlayerTournament `json:"registered"`
}

type PlayerTournament struct {
	URL           string `json:"url"`
	ID            string `json:"@id"`
	Wins          int    `json:"wins"`
	Losses        int    `json:"losses"`
	Draws         int    `json:"draws"`
	PointsAwarded int    `json:"points_awarded"`
	Placement     int    `json:"placement"`
	Status        string `json:"status"`
	TotalPlayers  int    `json:"total_players"`
}

func runPlayerTournaments(cmd *cobra.Command, args []string) error {
	username, _ := cmd.Flags().GetString("username")
	jsonOutput, _ := cmd.Flags().GetBool("json")
	url := fmt.Sprintf("https://api.chess.com/pub/player/%s/tournaments", strings.ToLower(username))
	body, err := requests.Get(url, requests.Options{})
	if err != nil {
		return fmt.Errorf("failed to fetch tournaments: %w", err)
	}
	var resp PlayerTournamentsResponse
	if err := json.Unmarshal(body, &resp); err != nil {
		return fmt.Errorf("failed to parse tournaments: %w", err)
	}
	if jsonOutput {
		b, _ := json.MarshalIndent(resp, "", "  ")
		fmt.Println(string(b))
		return nil
	}
	fmt.Println()
	fmt.Printf("Tournaments for %s:\n", username)
	if len(resp.InProgress) > 0 {
		fmt.Printf("\nIn progress:\n")
		for _, t := range resp.InProgress {
			fmt.Printf("  %s\n", t.ID)
		}
	}
	if len(resp.Registered) > 0 {
		fmt.Printf("\nRegistered:\n")
		for _, t := range resp.Registered {
			fmt.Printf("  %s\n", t.ID)
		}
	}
	if len(resp.Finished) > 0 {
		fmt.Printf("\nFinished:\n")
		for _, t := range resp.Finished {
			fmt.Printf("  %s (placement: %d/%d)\n", t.ID, t.Placement, t.TotalPlayers)
		}
	}
	return nil
}
