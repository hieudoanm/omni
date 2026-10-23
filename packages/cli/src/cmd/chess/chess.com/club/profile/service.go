package profile

import (
	"encoding/json"
	"fmt"
	"strings"

	"github.com/spf13/cobra"

	"github.com/hieudoanm/omni/packages/cli/src/libs/requests"
)

type ClubProfile struct {
	ID                 string   `json:"@id"`
	Name               string   `json:"name"`
	ClubID             int      `json:"club_id"`
	Icon               string   `json:"icon"`
	Country            string   `json:"country"`
	AverageDailyRating int      `json:"average_daily_rating"`
	MembersCount       int      `json:"members_count"`
	Created            int64    `json:"created"`
	LastActivity       int64    `json:"last_activity"`
	Visibility         string   `json:"visibility"`
	JoinRequest        string   `json:"join_request"`
	Admin              []string `json:"admin"`
	Description        string   `json:"description"`
}

func runClubProfile(cmd *cobra.Command, args []string) error {
	clubID, _ := cmd.Flags().GetString("club")
	jsonOutput, _ := cmd.Flags().GetBool("json")
	url := fmt.Sprintf("https://api.chess.com/pub/club/%s", clubID)
	body, err := requests.Get(url, requests.Options{})
	if err != nil {
		return fmt.Errorf("failed to fetch club: %w", err)
	}
	var profile ClubProfile
	if err := json.Unmarshal(body, &profile); err != nil {
		return fmt.Errorf("failed to parse club: %w", err)
	}
	if jsonOutput {
		b, _ := json.MarshalIndent(profile, "", "  ")
		fmt.Println(string(b))
		return nil
	}
	fmt.Println()
	fmt.Printf("Club: %s\n", profile.Name)
	fmt.Println(strings.Repeat("-", 50))
	fmt.Printf("Members : %d\n", profile.MembersCount)
	fmt.Printf("Avg Rating: %d\n", profile.AverageDailyRating)
	fmt.Printf("Visibility: %s\n", profile.Visibility)
	if profile.Description != "" {
		fmt.Printf("Desc    : %s\n", profile.Description)
	}
	return nil
}
