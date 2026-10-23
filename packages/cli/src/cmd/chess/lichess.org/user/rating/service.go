package rating

import (
	"encoding/json"
	"fmt"
	"net/url"
	"time"

	"github.com/hieudoanm/omni/packages/cli/src/libs/requests"
	"github.com/spf13/cobra"
)

type RatingHistoryEntry struct {
	Name   string   `json:"name"`
	Points [][4]int `json:"points"`
}

func runRating(cmd *cobra.Command, args []string) error {
	jsonOut, _ := cmd.Flags().GetBool("json")
	username := args[0]

	apiURL := fmt.Sprintf("https://lichess.org/api/user/%s/rating-history", url.PathEscape(username))
	body, err := requests.Get(apiURL, requests.Options{})
	if err != nil {
		return fmt.Errorf("failed to fetch rating history: %w", err)
	}

	var history []RatingHistoryEntry
	if err := json.Unmarshal(body, &history); err != nil {
		return fmt.Errorf("failed to parse rating history: %w", err)
	}

	if jsonOut {
		b, _ := json.MarshalIndent(history, "", "  ")
		fmt.Println(string(b))
		return nil
	}

	fmt.Println()
	fmt.Printf("♞ %s — Rating History\n", username)
	fmt.Println("------------------------------------------------")

	for _, entry := range history {
		if len(entry.Points) == 0 {
			continue
		}
		last := entry.Points[len(entry.Points)-1]
		t := time.Date(last[0], time.Month(last[1]+1), last[2], 0, 0, 0, 0, time.UTC)
		fmt.Printf("  %-16s %4d (last: %s)\n", entry.Name+":", last[3], t.Format("2006-01-02"))
	}

	return nil
}
