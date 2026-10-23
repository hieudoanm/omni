package lowercase

import (
	"fmt"
	"strings"

	"github.com/hieudoanm/omni/packages/cli/src/cmd/convert/internal"
	"github.com/spf13/cobra"
)

type result struct {
	Text      string `json:"text"`
	Lowercase string `json:"lowercase"`
}

func Run(cmd *cobra.Command, args []string) error {
	text, err := internal.ResolveText(args)
	if err != nil {
		return err
	}
	l := strings.ToLower(text)
	useJSON, _ := cmd.Flags().GetBool("json")
	if useJSON {
		return internal.WriteJSON(cmd, result{Text: text, Lowercase: l})
	}
	fmt.Fprintln(cmd.OutOrStdout(), l)
	return nil
}
