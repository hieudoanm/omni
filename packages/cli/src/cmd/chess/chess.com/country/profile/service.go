package profile

import (
	"encoding/json"
	"fmt"
	"strings"

	"github.com/spf13/cobra"

	"github.com/hieudoanm/omni/packages/cli/src/libs/requests"
)

type CountryProfile struct {
	ID   string `json:"@id"`
	Name string `json:"name"`
	Code string `json:"code"`
}

func runCountryProfile(cmd *cobra.Command, args []string) error {
	code, _ := cmd.Flags().GetString("code")
	jsonOutput, _ := cmd.Flags().GetBool("json")
	url := fmt.Sprintf("https://api.chess.com/pub/country/%s", strings.ToUpper(code))
	body, err := requests.Get(url, requests.Options{})
	if err != nil {
		return fmt.Errorf("failed to fetch country: %w", err)
	}
	var profile CountryProfile
	if err := json.Unmarshal(body, &profile); err != nil {
		return fmt.Errorf("failed to parse country: %w", err)
	}
	if jsonOutput {
		b, _ := json.MarshalIndent(profile, "", "  ")
		fmt.Println(string(b))
		return nil
	}
	fmt.Printf("Country: %s (%s)\n", profile.Name, profile.Code)
	return nil
}
