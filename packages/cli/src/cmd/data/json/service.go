package json

import (
	"fmt"

	"github.com/hieudoanm/omni/packages/cli/src/cmd/data/internal"
)

func runE(args []string, query, diff, merge string) error {
	if diff != "" {
		return internal.JSONDiff(args[0], diff)
	}
	if merge != "" {
		return internal.JSONMerge(args[0], merge)
	}

	input, err := internal.ReadInput(args)
	if err != nil {
		return err
	}

	if query != "" {
		data, err := internal.ParseJSON(input)
		if err != nil {
			return err
		}
		result, err := internal.JSONQuery(data, query)
		if err != nil {
			return err
		}
		fmt.Println(internal.OutputJSON(result))
		return nil
	}

	data, err := internal.ParseJSON(input)
	if err != nil {
		return err
	}
	fmt.Println(internal.OutputJSON(data))
	return nil
}
