package activity

import (
	"encoding/json"
	"fmt"
	"net/url"

	"github.com/hieudoanm/omni/packages/cli/src/libs/requests"
	"github.com/spf13/cobra"
)

type UserActivity struct {
	Interval struct {
		Start int64 `json:"start"`
		End   int64 `json:"end"`
	} `json:"interval"`
	Games       map[string]GameScore `json:"games,omitempty"`
	Puzzles     *PuzzleScore         `json:"puzzles,omitempty"`
	Tournaments *TournamentActivity  `json:"tournaments,omitempty"`
}

type GameScore struct {
	Win  int `json:"win"`
	Loss int `json:"loss"`
	Draw int `json:"draw"`
	Rp   struct {
		Before int `json:"before"`
		After  int `json:"after"`
	} `json:"rp"`
}

type PuzzleScore struct {
	Score GameScore `json:"score"`
}

type TournamentActivity struct {
	Nb   int `json:"nb"`
	Best []struct {
		Tournament struct {
			ID   string `json:"id"`
			Name string `json:"name"`
		} `json:"tournament"`
		NbGames     int `json:"nbGames"`
		Score       int `json:"score"`
		Rank        int `json:"rank"`
		RankPercent int `json:"rankPercent"`
	} `json:"best"`
}

func runActivity(cmd *cobra.Command, args []string) error {
	jsonOut, _ := cmd.Flags().GetBool("json")
	username := args[0]

	apiURL := fmt.Sprintf("https://lichess.org/api/user/%s/activity", url.PathEscape(username))
	body, err := requests.Get(apiURL, requests.Options{})
	if err != nil {
		return fmt.Errorf("failed to fetch activity: %w", err)
	}

	var activities []UserActivity
	if err := json.Unmarshal(body, &activities); err != nil {
		return fmt.Errorf("failed to parse activity: %w", err)
	}

	if jsonOut {
		b, _ := json.MarshalIndent(activities, "", "  ")
		fmt.Println(string(b))
		return nil
	}

	fmt.Println()
	fmt.Printf("♞ %s — Recent Activity\n", username)
	fmt.Println("------------------------------------------------")

	for i, a := range activities {
		if i >= 10 {
			break
		}
		fmt.Printf("  Period %d:\n", i+1)
		for perf, score := range a.Games {
			fmt.Printf("    %s: %dW/%dL/%dD (rp: %+d)\n", perf, score.Win, score.Loss, score.Draw, score.Rp.After-score.Rp.Before)
		}
		if a.Puzzles != nil {
			s := a.Puzzles.Score
			fmt.Printf("    puzzles: %dW/%dL/%dD\n", s.Win, s.Loss, s.Draw)
		}
		if a.Tournaments != nil {
			fmt.Printf("    tournaments: %d played\n", a.Tournaments.Nb)
			for _, b := range a.Tournaments.Best {
				fmt.Printf("      best: %s  rank %d/%d  score %d\n", b.Tournament.Name, b.Rank, b.RankPercent, b.Score)
			}
		}
	}

	return nil
}
