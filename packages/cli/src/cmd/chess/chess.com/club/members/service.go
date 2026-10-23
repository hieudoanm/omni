package members

import (
	"encoding/json"
	"fmt"

	"github.com/spf13/cobra"

	"github.com/hieudoanm/omni/packages/cli/src/libs/requests"
)

type ClubMember struct {
	Username string `json:"username"`
	Joined   int64  `json:"joined"`
}

type ClubMembersResponse struct {
	Weekly  []ClubMember `json:"weekly"`
	Monthly []ClubMember `json:"monthly"`
	AllTime []ClubMember `json:"all_time"`
}

func runClubMembers(cmd *cobra.Command, args []string) error {
	clubID, _ := cmd.Flags().GetString("club")
	jsonOutput, _ := cmd.Flags().GetBool("json")
	url := fmt.Sprintf("https://api.chess.com/pub/club/%s/members", clubID)
	body, err := requests.Get(url, requests.Options{})
	if err != nil {
		return fmt.Errorf("failed to fetch members: %w", err)
	}
	var resp ClubMembersResponse
	if err := json.Unmarshal(body, &resp); err != nil {
		return fmt.Errorf("failed to parse members: %w", err)
	}
	if jsonOutput {
		b, _ := json.MarshalIndent(resp, "", "  ")
		fmt.Println(string(b))
		return nil
	}
	fmt.Println()
	fmt.Printf("Weekly  : %d members\n", len(resp.Weekly))
	fmt.Printf("Monthly : %d members\n", len(resp.Monthly))
	fmt.Printf("All time: %d members\n", len(resp.AllTime))
	return nil
}
