package tablebase

import (
	"encoding/json"
	"fmt"

	"github.com/hieudoanm/omni/packages/cli/src/libs/requests"
	"github.com/spf13/cobra"
)

type TablebaseMove struct {
	Uci      string `json:"uci"`
	San      string `json:"san"`
	Category string `json:"category"`
	Dtm      *int   `json:"dtm,omitempty"`
}

type TablebaseResponse struct {
	Category  string          `json:"category"`
	Checkmate bool            `json:"checkmate,omitempty"`
	Stalemate bool            `json:"stalemate,omitempty"`
	Moves     []TablebaseMove `json:"moves"`
}

func runTablebase(cmd *cobra.Command, args []string) error {
	jsonOut, _ := cmd.Flags().GetBool("json")
	fen := args[0]

	body, err := requests.Get(
		"https://tablebase.lichess.org/standard",
		requests.Options{Query: map[string]string{"fen": fen}},
	)
	if err != nil {
		return fmt.Errorf("failed to fetch tablebase: %w", err)
	}

	var tb TablebaseResponse
	if err := json.Unmarshal(body, &tb); err != nil {
		return fmt.Errorf("failed to parse tablebase: %w", err)
	}

	if jsonOut {
		b, _ := json.MarshalIndent(tb, "", "  ")
		fmt.Println(string(b))
		return nil
	}

	fmt.Println()
	fmt.Println("♞ Syzygy Tablebase")
	fmt.Println("------------------------------------------------")
	fmt.Printf("Category: %s\n", tb.Category)
	if tb.Checkmate {
		fmt.Println("Result  : Checkmate")
	} else if tb.Stalemate {
		fmt.Println("Result  : Stalemate")
	}
	fmt.Println()
	fmt.Println("Top moves:")
	for i, m := range tb.Moves {
		if i >= 10 {
			break
		}
		dtm := ""
		if m.Dtm != nil {
			dtm = fmt.Sprintf(" (DTM: %d)", *m.Dtm)
		}
		fmt.Printf("  %s (%s)%s\n", m.San, m.Category, dtm)
	}

	return nil
}
