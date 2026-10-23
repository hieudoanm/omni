package streamer

import (
	"encoding/json"
	"fmt"

	"github.com/spf13/cobra"

	"github.com/hieudoanm/omni/packages/cli/src/libs/requests"
)

type Streamer struct {
	Username  string `json:"username"`
	Avatar    string `json:"avatar"`
	TwitchURL string `json:"twitch_url"`
	URL       string `json:"url"`
}

type StreamersResponse struct {
	Streamers []Streamer `json:"streamers"`
}

func runStreamer(cmd *cobra.Command, args []string) error {
	jsonOutput, _ := cmd.Flags().GetBool("json")
	body, err := requests.Get("https://api.chess.com/pub/streamers", requests.Options{})
	if err != nil {
		return fmt.Errorf("failed to fetch streamers: %w", err)
	}
	var resp StreamersResponse
	if err := json.Unmarshal(body, &resp); err != nil {
		return fmt.Errorf("failed to parse streamers: %w", err)
	}
	if jsonOutput {
		b, _ := json.MarshalIndent(resp, "", "  ")
		fmt.Println(string(b))
		return nil
	}
	if len(resp.Streamers) == 0 {
		fmt.Println("No streamers found")
		return nil
	}
	fmt.Println()
	for _, s := range resp.Streamers {
		fmt.Printf("  %s | %s\n", s.Username, s.TwitchURL)
	}
	return nil
}
