package validate

import (
	"encoding/json"
	"fmt"

	"github.com/hieudoanm/omni/packages/cli/src/cmd/doi/internal"
	"github.com/spf13/cobra"
)

func runValidate(cmd *cobra.Command, args []string) error {
	var id string
	if len(args) > 0 {
		id = args[0]
	} else {
		if ok, _ := cmd.Flags().GetBool("json"); ok {
			b, _ := json.MarshalIndent(map[string]interface{}{
				"error": "doi is required",
			}, "", "  ")
			fmt.Println(string(b))
		} else {
			fmt.Println("Usage: doi validate <doi>")
		}
		return nil
	}

	matched := internal.IsValidDOI(id)
	if ok, _ := cmd.Flags().GetBool("json"); ok {
		b, _ := json.MarshalIndent(map[string]interface{}{
			"doi":   id,
			"valid": matched,
		}, "", "  ")
		fmt.Println(string(b))
	} else {
		if matched {
			fmt.Printf("✓ %s is a valid DOI\n", id)
		} else {
			fmt.Printf("✗ %s is not a valid DOI format\n", id)
		}
	}
	return nil
}
