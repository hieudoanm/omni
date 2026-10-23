package pgn

import (
	"fmt"
	"strings"

	"github.com/spf13/cobra"

	"github.com/hieudoanm/omni/packages/cli/src/libs/requests"
)

func runPgn(cmd *cobra.Command, args []string) error {
	username, _ := cmd.Flags().GetString("username")
	year, _ := cmd.Flags().GetString("year")
	month, _ := cmd.Flags().GetString("month")
	url := fmt.Sprintf("https://api.chess.com/pub/player/%s/games/%s/%s/pgn", strings.ToLower(username), year, month)
	body, err := requests.Get(url, requests.Options{})
	if err != nil {
		return fmt.Errorf("failed to download PGN: %w", err)
	}
	fmt.Println(string(body))
	return nil
}
