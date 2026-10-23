package matches

import (
	"encoding/json"
	"fmt"
	"strings"

	"github.com/spf13/cobra"

	"github.com/hieudoanm/omni/packages/cli/src/libs/requests"
)

type PlayerMatchesResponse struct {
	Finished   []PlayerMatch `json:"finished"`
	InProgress []PlayerMatch `json:"in_progress"`
	Registered []PlayerMatch `json:"registered"`
}

type PlayerMatch struct {
	Name    string            `json:"name"`
	URL     string            `json:"url"`
	ID      string            `json:"@id"`
	Club    string            `json:"club"`
	Results map[string]string `json:"results"`
	Board   string            `json:"board"`
}

func runPlayerMatches(cmd *cobra.Command, args []string) error {
	username, _ := cmd.Flags().GetString("username")
	jsonOutput, _ := cmd.Flags().GetBool("json")
	url := fmt.Sprintf("https://api.chess.com/pub/player/%s/matches", strings.ToLower(username))
	body, err := requests.Get(url, requests.Options{})
	if err != nil {
		return fmt.Errorf("failed to fetch matches: %w", err)
	}
	var resp PlayerMatchesResponse
	if err := json.Unmarshal(body, &resp); err != nil {
		return fmt.Errorf("failed to parse matches: %w", err)
	}
	if jsonOutput {
		b, _ := json.MarshalIndent(resp, "", "  ")
		fmt.Println(string(b))
		return nil
	}
	fmt.Println()
	fmt.Printf("Matches for %s:\n", username)
	if len(resp.InProgress) > 0 {
		fmt.Printf("\nIn progress:\n")
		for _, m := range resp.InProgress {
			fmt.Printf("  %s\n", m.Name)
		}
	}
	if len(resp.Registered) > 0 {
		fmt.Printf("\nRegistered:\n")
		for _, m := range resp.Registered {
			fmt.Printf("  %s\n", m.Name)
		}
	}
	if len(resp.Finished) > 0 {
		fmt.Printf("\nFinished:\n")
		for _, m := range resp.Finished {
			fmt.Printf("  %s\n", m.Name)
		}
	}
	return nil
}
