package list

import (
	"encoding/json"
	"fmt"
	"os"

	"github.com/hieudoanm/omni/packages/cli/src/libs/history"
)

func runList(limit int, jsonOutput bool) error {
	entries, err := history.List(limit)
	if err != nil {
		return err
	}
	if len(entries) == 0 {
		if jsonOutput {
			fmt.Println("[]")
		} else {
			fmt.Fprintln(os.Stderr, "no history entries")
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
