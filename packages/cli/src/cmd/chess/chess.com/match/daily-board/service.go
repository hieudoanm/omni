package dailyboard

import (
	"encoding/json"
	"fmt"

	"github.com/spf13/cobra"

	"github.com/hieudoanm/omni/packages/cli/src/cmd/chess/chess.com/match/internal"
	"github.com/hieudoanm/omni/packages/cli/src/libs/requests"
)

func runDailyBoard(cmd *cobra.Command, args []string) error {
	id, _ := cmd.Flags().GetString("id")
	board, _ := cmd.Flags().GetInt("board")
	jsonOutput, _ := cmd.Flags().GetBool("json")
	url := fmt.Sprintf("https://api.chess.com/pub/match/%s/%d", id, board)
	body, err := requests.Get(url, requests.Options{})
	if err != nil {
		return fmt.Errorf("failed to fetch board: %w", err)
	}
	var resp internal.MatchBoardResponse
	if err := json.Unmarshal(body, &resp); err != nil {
		return fmt.Errorf("failed to parse board: %w", err)
	}
	if jsonOutput {
		b, _ := json.MarshalIndent(resp, "", "  ")
		fmt.Println(string(b))
		return nil
	}
	fmt.Printf("Board %d: %d games\n", board, len(resp.Games))
	return nil
}
