package titled

import (
	"encoding/json"
	"fmt"
	"os"
	"strings"

	"github.com/spf13/cobra"

	"github.com/hieudoanm/omni/packages/cli/src/libs/number"
	"github.com/hieudoanm/omni/packages/cli/src/libs/requests"
)

type TitledResponse struct {
	Players []string `json:"players"`
}

var Titles = []string{"GM", "IM", "FM", "CM", "NM", "WGM", "WIM", "WFM", "WCM", "WNM"}

func runTitled(cmd *cobra.Command, args []string) error {
	jsonOutput, _ := cmd.Flags().GetBool("json")

	if jsonOutput {
		results := map[string]int{}
		for _, title := range Titles {
			count, err := fetchTitleCount(title)
			if err != nil {
				continue
			}
			results[title] = count
		}
		b, _ := json.MarshalIndent(map[string]interface{}{
			"titles": results,
		}, "", "  ")
		fmt.Println(string(b))
	} else {
		fmt.Println()
		fmt.Printf("| %-6s | %7s |\n", "Titled", "Players")
		fmt.Printf("| %-6s | %7s |\n", strings.Repeat("-", 6), strings.Repeat("-", 7))

		for _, title := range Titles {
			count, err := fetchTitleCount(title)
			if err != nil {
				fmt.Fprintf(os.Stderr, "❌ Failed to fetch %s: %v\n", title, err)
				continue
			}

			fmt.Printf("| %-6s | %7s |\n", title, number.Comma(count))
		}
		fmt.Println()
	}

	return nil
}

func fetchTitleCount(title string) (int, error) {
	url := fmt.Sprintf("https://api.chess.com/pub/titled/%s", title)

	body, err := requests.Get(url, requests.Options{})
	if err != nil {
		return 0, err
	}

	var res TitledResponse
	if err := json.Unmarshal(body, &res); err != nil {
		return 0, err
	}

	return len(res.Players), nil
}
