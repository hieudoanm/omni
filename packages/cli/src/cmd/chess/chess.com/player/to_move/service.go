package to_move

import (
	"encoding/json"
	"fmt"
	"strings"

	"github.com/spf13/cobra"

	"github.com/hieudoanm/omni/packages/cli/src/libs/requests"
)

type ToMoveResponse struct {
	Games []ToMoveGame `json:"games"`
}

type ToMoveGame struct {
	URL          string `json:"url"`
	MoveBy       int64  `json:"move_by"`
	DrawOffer    bool   `json:"draw_offer"`
	LastActivity int64  `json:"last_activity"`
}

func runToMove(cmd *cobra.Command, args []string) error {
	username, _ := cmd.Flags().GetString("username")
	jsonOutput, _ := cmd.Flags().GetBool("json")
	url := fmt.Sprintf("https://api.chess.com/pub/player/%s/games/to-move", strings.ToLower(username))
	body, err := requests.Get(url, requests.Options{})
	if err != nil {
		return fmt.Errorf("failed to fetch to-move games: %w", err)
	}
	var resp ToMoveResponse
	if err := json.Unmarshal(body, &resp); err != nil {
		return fmt.Errorf("failed to parse response: %w", err)
	}
	if jsonOutput {
		b, _ := json.MarshalIndent(resp, "", "  ")
		fmt.Println(string(b))
		return nil
	}
	if len(resp.Games) == 0 {
		fmt.Println("No games to move")
		return nil
	}
	fmt.Printf("%d games to move\n", len(resp.Games))
	return nil
}
