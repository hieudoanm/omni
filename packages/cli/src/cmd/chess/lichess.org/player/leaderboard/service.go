package leaderboard

import (
	"encoding/json"
	"fmt"
	"net/url"

	"github.com/hieudoanm/omni/packages/cli/src/libs/requests"
	"github.com/spf13/cobra"
)

type Leaderboard struct {
	Users []TopUser `json:"users"`
}

type TopUser struct {
	ID       string  `json:"id"`
	Username string  `json:"username"`
	Title    *string `json:"title,omitempty"`
	Rating   int     `json:"rating"`
	Progress int     `json:"progress"`
	Online   bool    `json:"online,omitempty"`
}

func runLeaderboard(cmd *cobra.Command, args []string) error {
	jsonOut, _ := cmd.Flags().GetBool("json")
	perfType := args[0]
	nb := "10"
	if len(args) > 1 {
		nb = args[1]
	}

	apiURL := fmt.Sprintf("https://lichess.org/api/player/top/%s/%s", url.PathEscape(nb), url.PathEscape(perfType))
	body, err := requests.Get(apiURL, requests.Options{})
	if err != nil {
		return fmt.Errorf("failed to fetch leaderboard: %w", err)
	}

	var board Leaderboard
	if err := json.Unmarshal(body, &board); err != nil {
		return fmt.Errorf("failed to parse leaderboard: %w", err)
	}

	if jsonOut {
		b, _ := json.MarshalIndent(board, "", "  ")
		fmt.Println(string(b))
		return nil
	}

	fmt.Println()
	fmt.Printf("♞ Lichess %s Top %d\n", perfType, len(board.Users))
	fmt.Println("------------------------------------------------")
	for i, u := range board.Users {
		title := ""
		if u.Title != nil {
			title = " " + *u.Title
		}
		online := ""
		if u.Online {
			online = " ●"
		}
		fmt.Printf("  %2d. %s%s (%d)%s\n", i+1, u.Username, title, u.Rating, online)
	}

	return nil
}
