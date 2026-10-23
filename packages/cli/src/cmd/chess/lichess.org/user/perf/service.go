package perf

import (
	"encoding/json"
	"fmt"
	"net/url"

	"github.com/hieudoanm/omni/packages/cli/src/libs/requests"
	"github.com/spf13/cobra"
)

type PerfStat struct {
	User struct {
		Name string `json:"name"`
	} `json:"user"`
	Perf struct {
		Glicko struct {
			Rating      float64 `json:"rating"`
			Deviation   float64 `json:"deviation"`
			Provisional bool    `json:"provisional"`
		} `json:"glicko"`
		Nb       int `json:"nb"`
		Progress int `json:"progress"`
	} `json:"perf"`
	Rank       *int     `json:"rank,omitempty"`
	Percentile *float64 `json:"percentile,omitempty"`
	Stat       struct {
		Highest *struct {
			Int    int    `json:"int"`
			At     string `json:"at"`
			GameId string `json:"gameId"`
		} `json:"highest,omitempty"`
		Lowest *struct {
			Int    int    `json:"int"`
			At     string `json:"at"`
			GameId string `json:"gameId"`
		} `json:"lowest,omitempty"`
	} `json:"stat"`
}

func runPerf(cmd *cobra.Command, args []string) error {
	jsonOut, _ := cmd.Flags().GetBool("json")
	username := args[0]
	perfType := args[1]

	apiURL := fmt.Sprintf("https://lichess.org/api/user/%s/perf/%s", url.PathEscape(username), url.PathEscape(perfType))
	body, err := requests.Get(apiURL, requests.Options{})
	if err != nil {
		return fmt.Errorf("failed to fetch perf stats: %w", err)
	}

	var stat PerfStat
	if err := json.Unmarshal(body, &stat); err != nil {
		return fmt.Errorf("failed to parse perf stats: %w", err)
	}

	if jsonOut {
		b, _ := json.MarshalIndent(stat, "", "  ")
		fmt.Println(string(b))
		return nil
	}

	fmt.Println()
	fmt.Printf("♞ %s — %s\n", stat.User.Name, perfType)
	fmt.Println("------------------------------------------------")
	fmt.Printf("Rating    : %.0f (dev: %.1f, prov: %v)\n", stat.Perf.Glicko.Rating, stat.Perf.Glicko.Deviation, stat.Perf.Glicko.Provisional)
	fmt.Printf("Games     : %d\n", stat.Perf.Nb)
	fmt.Printf("Progress  : %+d\n", stat.Perf.Progress)
	if stat.Rank != nil {
		fmt.Printf("Rank      : #%d\n", *stat.Rank)
	}
	if stat.Percentile != nil {
		fmt.Printf("Percentile: %.1f%%\n", *stat.Percentile*100)
	}
	if stat.Stat.Highest != nil {
		fmt.Printf("Highest   : %d\n", stat.Stat.Highest.Int)
	}
	if stat.Stat.Lowest != nil {
		fmt.Printf("Lowest    : %d\n", stat.Stat.Lowest.Int)
	}

	return nil
}
