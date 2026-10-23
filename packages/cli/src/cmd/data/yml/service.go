package yml

import (
	"fmt"

	"github.com/hieudoanm/omni/packages/cli/src/cmd/data/internal"
)

func runE(args []string, validate, lint, jsonOut bool) error {
	input, err := internal.ReadInput(args)
	if err != nil {
		return err
	}

	if validate {
		if err := internal.ValidateYAML(input); err != nil {
			return fmt.Errorf("invalid YAML: %w", err)
		}
		if jsonOut {
			fmt.Printf("{\"valid\":true,\"file\":%q}\n", firstArg(args))
		} else {
			fmt.Println("Valid YAML")
		}
		return nil
	}

	if lint {
		if err := internal.ValidateYAML(input); err != nil {
			return fmt.Errorf("YAML error: %w", err)
		}
		if jsonOut {
			fmt.Println(`{"valid":true,"lint":"no issues"}`)
		} else {
			fmt.Println("No lint issues found")
		}
		return nil
	}

	data, err := internal.ParseYAML(input)
	if err != nil {
		return err
	}

	if jsonOut {
		fmt.Println(internal.ConvertYAMLToJSON(data))
	} else {
		out, err := internal.FormatYAML(data)
		if err != nil {
			return err
		}
		fmt.Print(out)
	}
	return nil
}

func firstArg(args []string) string {
	if len(args) > 0 {
		return args[0]
	}
	return ""
}
