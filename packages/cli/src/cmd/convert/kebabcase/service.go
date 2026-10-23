package kebabcase

import (
	"fmt"

	"github.com/hieudoanm/omni/packages/cli/src/cmd/convert/internal"
	"github.com/spf13/cobra"
)

type result struct {
	Text      string `json:"text"`
	KebabCase string `json:"kebab-case"`
}

func Run(cmd *cobra.Command, args []string) error {
	text, err := internal.ResolveText(args)
	if err != nil {
		return err
	}
	k := internal.ToKebabCase(text)
	useJSON, _ := cmd.Flags().GetBool("json")
	if useJSON {
		return internal.WriteJSON(cmd, result{Text: text, KebabCase: k})
	}
	fmt.Fprintln(cmd.OutOrStdout(), k)
	return nil
}
