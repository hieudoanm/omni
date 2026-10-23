package livematch

import (
	"encoding/json"
	"fmt"
	"strings"

	"github.com/spf13/cobra"

	"github.com/hieudoanm/omni/packages/cli/src/cmd/chess/chess.com/match/internal"
	"github.com/hieudoanm/omni/packages/cli/src/libs/requests"
)

func runLiveMatch(cmd *cobra.Command, args []string) error {
	id, _ := cmd.Flags().GetString("id")
	jsonOutput, _ := cmd.Flags().GetBool("json")
	url := fmt.Sprintf("https://api.chess.com/pub/match/live/%s", id)
	body, err := requests.Get(url, requests.Options{})
	if err != nil {
		return fmt.Errorf("failed to fetch match: %w", err)
	}
	var match internal.MatchResponse
	if err := json.Unmarshal(body, &match); err != nil {
		return fmt.Errorf("failed to parse match: %w", err)
	}
	if jsonOutput {
		b, _ := json.MarshalIndent(match, "", "  ")
		fmt.Println(string(b))
		return nil
	}
	fmt.Println()
	fmt.Printf("Live Match: %s\n", match.Name)
	fmt.Println(strings.Repeat("-", 50))
	fmt.Printf("Status : %s\n", match.Status)
	fmt.Printf("Boards : %d\n", match.Boards)
	fmt.Printf("Team 1 : %s (%.1f)\n", match.Teams.Team1.Name, match.Teams.Team1.Score)
	fmt.Printf("Team 2 : %s (%.1f)\n", match.Teams.Team2.Name, match.Teams.Team2.Score)
	return nil
}
