package search

import (
	"encoding/json"
	"fmt"
	"os"

	"github.com/hieudoanm/omni/packages/cli/src/libs/history"
)

func runSearch(query string, limit int, jsonOutput bool) error {
	entries, err := history.Search(query, limit)
	if err != nil {
		return err
	}
	if len(entries) == 0 {
		if jsonOutput {
			fmt.Println("[]")
		} else {
			fmt.Fprintln(os.Stderr, "no matching entries")
		}
		return nil
	}
	if jsonOutput {
		out, _ := json.Marshal(entries)
		fmt.Println(string(out))
	} else {
		for _, e := range entries {
			fmt.Println(e.String())
		}
	}
	return nil
}
