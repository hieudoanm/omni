package snakecase

import (
	"fmt"

	"github.com/hieudoanm/omni/packages/cli/src/cmd/convert/internal"
	"github.com/spf13/cobra"
)

type result struct {
	Text      string `json:"text"`
	SnakeCase string `json:"snake_case"`
}

func Run(cmd *cobra.Command, args []string) error {
	text, err := internal.ResolveText(args)
	if err != nil {
		return err
	}
	s := internal.ToSnakeCase(text)
	useJSON, _ := cmd.Flags().GetBool("json")
	if useJSON {
		return internal.WriteJSON(cmd, result{Text: text, SnakeCase: s})
	}
	fmt.Fprintln(cmd.OutOrStdout(), s)
	return nil
}
