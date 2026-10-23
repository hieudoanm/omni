package profile

import (
	"encoding/json"
	"fmt"
	"strings"

	"github.com/spf13/cobra"

	"github.com/hieudoanm/omni/packages/cli/src/libs/requests"
)

type PlayerProfile struct {
	ID         string `json:"@id"`
	URL        string `json:"url"`
	Username   string `json:"username"`
	PlayerID   int    `json:"player_id"`
	Title      string `json:"title"`
	Status     string `json:"status"`
	Name       string `json:"name"`
	Avatar     string `json:"avatar"`
	Location   string `json:"location"`
	Country    string `json:"country"`
	Joined     int64  `json:"joined"`
	LastOnline int64  `json:"last_online"`
	Followers  int    `json:"followers"`
	IsStreamer bool   `json:"is_streamer"`
	TwitchURL  string `json:"twitch_url"`
	FIDE       int    `json:"fide"`
}

func runPlayerProfile(cmd *cobra.Command, args []string) error {
	username, _ := cmd.Flags().GetString("username")
	jsonOutput, _ := cmd.Flags().GetBool("json")
	url := fmt.Sprintf("https://api.chess.com/pub/player/%s", strings.ToLower(username))
	body, err := requests.Get(url, requests.Options{})
	if err != nil {
		return fmt.Errorf("failed to fetch profile: %w", err)
	}
	var profile PlayerProfile
	if err := json.Unmarshal(body, &profile); err != nil {
		return fmt.Errorf("failed to parse profile: %w", err)
	}
	if jsonOutput {
		b, _ := json.MarshalIndent(profile, "", "  ")
		fmt.Println(string(b))
		return nil
	}
	fmt.Println()
	fmt.Printf("Player: %s\n", strings.ToUpper(profile.Username))
	fmt.Println(strings.Repeat("-", 50))
	if profile.Name != "" {
		fmt.Printf("Name     : %s\n", profile.Name)
	}
	if profile.Title != "" {
		fmt.Printf("Title    : %s\n", profile.Title)
	}
	fmt.Printf("Status   : %s\n", profile.Status)
	if profile.Location != "" {
		fmt.Printf("Location : %s\n", profile.Location)
	}
	fmt.Printf("Followers: %d\n", profile.Followers)
	if profile.FIDE > 0 {
		fmt.Printf("FIDE     : %d\n", profile.FIDE)
	}
	if profile.IsStreamer {
		fmt.Printf("Streamer : %s\n", profile.TwitchURL)
	}
	return nil
}
