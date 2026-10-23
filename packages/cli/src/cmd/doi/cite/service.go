package cite

import (
	"encoding/json"
	"fmt"

	"github.com/hieudoanm/omni/packages/cli/src/cmd/doi/internal"
	"github.com/spf13/cobra"
)

func runCite(cmd *cobra.Command, args []string) error {
	id, err := internal.ResolveDOI(args)
	if err != nil {
		return err
	}
	data, err := internal.FetchCrossref(id)
	if err != nil {
		return err
	}

	if ok, _ := cmd.Flags().GetBool("json"); ok {
		b, _ := json.MarshalIndent(map[string]interface{}{
			"doi":  id,
			"data": data,
		}, "", "  ")
		fmt.Println(string(b))
		return nil
	}

	internal.PrintCitation(data)
	return nil
}
