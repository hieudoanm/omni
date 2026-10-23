package info

import (
	"encoding/json"
	"fmt"

	"github.com/hieudoanm/omni/packages/cli/src/libs/requests"
	"github.com/spf13/cobra"
)

type ArenaTournament struct {
	ID       string `json:"id"`
	FullName string `json:"fullName"`
	Rated    bool   `json:"rated,omitempty"`
	Clock    struct {
		Limit     int `json:"limit"`
		Increment int `json:"increment"`
	} `json:"clock"`
	Minutes         int    `json:"minutes,omitempty"`
	CreatedBy       string `json:"createdBy,omitempty"`
	System          string `json:"system,omitempty"`
	SecondsToStart  int    `json:"secondsToStart,omitempty"`
	SecondsToFinish int    `json:"secondsToFinish,omitempty"`
	IsFinished      bool   `json:"isFinished,omitempty"`
	NbPlayers       int    `json:"nbPlayers"`
	Variant         string `json:"variant,omitempty"`
	Description     string `json:"description,omitempty"`
	Perf            *struct {
		Icon string `json:"icon"`
		Key  string `json:"key"`
		Name string `json:"name"`
	} `json:"perf,omitempty"`
	Standing *struct {
		Page    int `json:"page"`
		Players []struct {
			Name   string  `json:"name"`
			Title  *string `json:"title,omitempty"`
			Rank   int     `json:"rank"`
			Rating int     `json:"rating"`
			Score  int     `json:"score"`
		} `json:"players"`
	} `json:"standing,omitempty"`
	Stats *struct {
		Games         int `json:"games"`
		Moves         int `json:"moves"`
		WhiteWins     int `json:"whiteWins"`
		BlackWins     int `json:"blackWins"`
		Draws         int `json:"draws"`
		AverageRating int `json:"averageRating"`
	} `json:"stats,omitempty"`
}

func runInfo(cmd *cobra.Command, args []string) error {
	jsonOut, _ := cmd.Flags().GetBool("json")
	id := args[0]

	body, err := requests.Get(fmt.Sprintf("https://lichess.org/api/tournament/%s", id), requests.Options{})
	if err != nil {
		return fmt.Errorf("failed to fetch tournament: %w", err)
	}

	var t ArenaTournament
	if err := json.Unmarshal(body, &t); err != nil {
		return fmt.Errorf("failed to parse tournament: %w", err)
	}

	if jsonOut {
		b, _ := json.MarshalIndent(t, "", "  ")
		fmt.Println(string(b))
		return nil
	}

	fmt.Println()
	fmt.Printf("♞ %s\n", t.FullName)
	fmt.Println("------------------------------------------------")
	if t.Perf != nil {
		fmt.Printf("Type    : %s (%s)\n", t.Perf.Name, t.System)
	}
	fmt.Printf("Clock   : %d+%d\n", t.Clock.Limit, t.Clock.Increment)
	fmt.Printf("Players : %d\n", t.NbPlayers)
	if t.IsFinished {
		fmt.Println("Status  : finished")
	} else if t.SecondsToStart > 0 {
		fmt.Printf("Starts  : in %ds\n", t.SecondsToStart)
	} else {
		fmt.Printf("Finishes: in %ds\n", t.SecondsToFinish)
	}
	if t.Description != "" {
		fmt.Printf("Info    : %s\n", t.Description)
	}

	if t.Stats != nil {
		fmt.Println()
		fmt.Println("Stats:")
		fmt.Printf("  Games   : %d\n", t.Stats.Games)
		fmt.Printf("  Moves   : %d\n", t.Stats.Moves)
		fmt.Printf("  Result  : %dW / %dB / %dD\n", t.Stats.WhiteWins, t.Stats.BlackWins, t.Stats.Draws)
		fmt.Printf("  Avg     : %d\n", t.Stats.AverageRating)
	}

	if t.Standing != nil && len(t.Standing.Players) > 0 {
		fmt.Println()
		fmt.Printf("Standing (top %d):\n", len(t.Standing.Players))
		for _, p := range t.Standing.Players {
			title := ""
			if p.Title != nil {
				title = " " + *p.Title
			}
			fmt.Printf("  #%d  %s%s (%d)  score: %d\n", p.Rank, p.Name, title, p.Rating, p.Score)
		}
	}

	return nil
}
