package clubs

import (
	"encoding/json"
	"fmt"
	"strings"

	"github.com/spf13/cobra"

	"github.com/hieudoanm/omni/packages/cli/src/libs/requests"
)

type CountryClubsResponse struct {
	Clubs []string `json:"clubs"`
}

func runCountryClubs(cmd *cobra.Command, args []string) error {
	code, _ := cmd.Flags().GetString("code")
	jsonOutput, _ := cmd.Flags().GetBool("json")
	url := fmt.Sprintf("https://api.chess.com/pub/country/%s/clubs", strings.ToUpper(code))
	body, err := requests.Get(url, requests.Options{})
	if err != nil {
		return fmt.Errorf("failed to fetch clubs: %w", err)
	}
	var resp CountryClubsResponse
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
		fmt.Println(c)
	}
	return nil
}
