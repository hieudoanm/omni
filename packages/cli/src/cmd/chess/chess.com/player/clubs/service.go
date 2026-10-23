package clubs

import (
	"encoding/json"
	"fmt"
	"strings"

	"github.com/spf13/cobra"

	"github.com/hieudoanm/omni/packages/cli/src/libs/requests"
)

type PlayerClubsResponse struct {
	Clubs []PlayerClub `json:"clubs"`
}

type PlayerClub struct {
	ID           string `json:"@id"`
	Name         string `json:"name"`
	LastActivity int64  `json:"last_activity"`
	Icon         string `json:"icon"`
	URL          string `json:"url"`
	Joined       int64  `json:"joined"`
}

func runPlayerClubs(cmd *cobra.Command, args []string) error {
	username, _ := cmd.Flags().GetString("username")
	jsonOutput, _ := cmd.Flags().GetBool("json")
	url := fmt.Sprintf("https://api.chess.com/pub/player/%s/clubs", strings.ToLower(username))
	body, err := requests.Get(url, requests.Options{})
	if err != nil {
		return fmt.Errorf("failed to fetch clubs: %w", err)
	}
	var resp PlayerClubsResponse
	if err := json.Unmarshal(body, &resp); err != nil {
		return fmt.Errorf("failed to parse clubs: %w", err)
	}
	if jsonOutput {
		b, _ := json.MarshalIndent(resp, "", "  ")
		fmt.Println(string(b))
		return nil
	}
	if len(resp.Clubs) == 0 {
		fmt.Println("No clubs found")
		return nil
	}
	fmt.Println()
	for _, c := range resp.Clubs {
		fmt.Printf("  %s\n", c.Name)
	}
	return nil
}
