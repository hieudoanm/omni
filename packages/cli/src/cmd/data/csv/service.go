package csv

import (
	"fmt"

	"github.com/hieudoanm/omni/packages/cli/src/cmd/data/internal"
)

func runE(args []string, jsonOut bool) error {
	records, err := internal.ReadCSVInput(args)
	if err != nil {
		return err
	}

	if jsonOut {
		fmt.Println(internal.FormatCSVJSON(records))
	} else {
		fmt.Println(internal.FormatCSVText(records))
	}

	return nil
}
