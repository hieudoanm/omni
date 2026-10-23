package capitalise

import (
	"fmt"

	"github.com/hieudoanm/omni/packages/cli/src/cmd/convert/internal"
	"github.com/spf13/cobra"
)

type result struct {
	Text       string `json:"text"`
	Capitalise string `json:"capitalise"`
}

func Run(cmd *cobra.Command, args []string) error {
	text, err := internal.ResolveText(args)
	if err != nil {
		return err
	}
	c := internal.Capitalise(text)
	useJSON, _ := cmd.Flags().GetBool("json")
	if useJSON {
		return internal.WriteJSON(cmd, result{Text: text, Capitalise: c})
	}
	fmt.Fprintln(cmd.OutOrStdout(), c)
	return nil
}
