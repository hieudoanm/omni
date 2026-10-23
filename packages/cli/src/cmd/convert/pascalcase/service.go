package pascalcase

import (
	"fmt"

	"github.com/hieudoanm/omni/packages/cli/src/cmd/convert/internal"
	"github.com/spf13/cobra"
)

type result struct {
	Text       string `json:"text"`
	PascalCase string `json:"PascalCase"`
}

func Run(cmd *cobra.Command, args []string) error {
	text, err := internal.ResolveText(args)
	if err != nil {
		return err
	}
	p := internal.ToPascalCase(text)
	useJSON, _ := cmd.Flags().GetBool("json")
	if useJSON {
		return internal.WriteJSON(cmd, result{Text: text, PascalCase: p})
	}
	fmt.Fprintln(cmd.OutOrStdout(), p)
	return nil
}
