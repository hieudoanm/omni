package uppercase

import (
	"fmt"
	"strings"

	"github.com/hieudoanm/omni/packages/cli/src/cmd/convert/internal"
	"github.com/spf13/cobra"
)

type result struct {
	Text      string `json:"text"`
	Uppercase string `json:"uppercase"`
}

func Run(cmd *cobra.Command, args []string) error {
	text, err := internal.ResolveText(args)
	if err != nil {
		return err
	}
	u := strings.ToUpper(text)
	useJSON, _ := cmd.Flags().GetBool("json")
	if useJSON {
		return internal.WriteJSON(cmd, result{Text: text, Uppercase: u})
	}
	fmt.Fprintln(cmd.OutOrStdout(), u)
	return nil
}
