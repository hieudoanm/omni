package results

import (
	"bufio"
	"encoding/json"
	"fmt"
	"strings"

	"github.com/hieudoanm/omni/packages/cli/src/libs/requests"
	"github.com/spf13/cobra"
)

type TournamentResult struct {
	Rank        int    `json:"rank"`
	Score       int    `json:"score"`
	Rating      int    `json:"rating"`
	Username    string `json:"username"`
	Performance int    `json:"performance"`
	Title       string `json:"title,omitempty"`
}

func runResults(cmd *cobra.Command, args []string) error {
	jsonOut, _ := cmd.Flags().GetBool("json")
	nb, _ := cmd.Flags().GetInt("top")
	id := args[0]

	opts := requests.Options{}
	if nb > 0 {
		opts.Query = map[string]string{"nb": fmt.Sprintf("%d", nb)}
	}

	body, err := requests.Get(fmt.Sprintf("https://lichess.org/api/tournament/%s/results", id), opts)
	if err != nil {
		return fmt.Errorf("failed to fetch tournament results: %w", err)
	}

	var results []TournamentResult
	scanner := bufio.NewScanner(strings.NewReader(string(body)))
	for scanner.Scan() {
		line := scanner.Text()
		if line == "" {
			continue
		}
		var r TournamentResult
		if err := json.Unmarshal([]byte(line), &r); err != nil {
			continue
		}
		results = append(results, r)
	}

	if jsonOut {
		b, _ := json.MarshalIndent(results, "", "  ")
		fmt.Println(string(b))
		return nil
	}

	fmt.Println()
	fmt.Printf("♞ Tournament Results (%d)\n", len(results))
	fmt.Println("------------------------------------------------")
	for _, r := range results {
		title := ""
		if r.Title != "" {
			title = " " + r.Title
		}
		fmt.Printf("  #%d  %s%s (%d)  score: %d  perf: %d\n", r.Rank, r.Username, title, r.Rating, r.Score, r.Performance)
	}

	return nil
}
