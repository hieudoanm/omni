package slug

import (
	"fmt"

	"github.com/hieudoanm/omni/packages/cli/src/cmd/convert/internal"
	"github.com/spf13/cobra"
)

type result struct {
	Text string `json:"text"`
	Slug string `json:"slug"`
}

func Run(cmd *cobra.Command, args []string) error {
	text, err := internal.ResolveText(args)
	if err != nil {
		return err
	}
	s := internal.Slug(text)
	useJSON, _ := cmd.Flags().GetBool("json")
	if useJSON {
		return internal.WriteJSON(cmd, result{Text: text, Slug: s})
	}
	fmt.Fprintln(cmd.OutOrStdout(), s)
	return nil
}
