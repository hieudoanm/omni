package fetch

import (
	"encoding/json"
	"fmt"

	"github.com/hieudoanm/omni/packages/cli/src/cmd/doi/internal"
	"github.com/spf13/cobra"
)

func runFetch(cmd *cobra.Command, args []string) error {
	id, err := internal.ResolveDOI(args)
	if err != nil {
		return err
	}
	data, err := internal.FetchCrossref(id)
	if err != nil {
		return err
	}
	b, _ := json.MarshalIndent(data, "", "  ")
	fmt.Println(string(b))
	return nil
}
