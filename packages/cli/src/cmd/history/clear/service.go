package clear

import (
	"fmt"

	"github.com/hieudoanm/omni/packages/cli/src/libs/history"
)

func runClear(jsonOutput bool) error {
	if err := history.Clear(); err != nil {
		return err
	}
	if jsonOutput {
		fmt.Println(`{"status":"cleared"}`)
	} else {
		fmt.Println("history cleared")
	}
	return nil
}
