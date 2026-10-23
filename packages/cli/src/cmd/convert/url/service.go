package url

import (
	"fmt"
	"net/url"

	"github.com/hieudoanm/omni/packages/cli/src/cmd/convert/internal"
	"github.com/spf13/cobra"
)

type result struct {
	Input  string `json:"input"`
	Output string `json:"output"`
	Mode   string `json:"mode"`
}

func Run(cmd *cobra.Command, args []string, decode bool) error {
	text, err := internal.ResolveText(args)
	if err != nil {
		return err
	}
	useJSON, _ := cmd.Flags().GetBool("json")
	if decode {
		r, err := url.QueryUnescape(text)
		if err != nil {
			return err
		}
		if useJSON {
			return internal.WriteJSON(cmd, result{Input: text, Output: r, Mode: "decode"})
		}
		fmt.Fprintln(cmd.OutOrStdout(), r)
	} else {
		r := url.QueryEscape(text)
		if useJSON {
			return internal.WriteJSON(cmd, result{Input: text, Output: r, Mode: "encode"})
		}
		fmt.Fprintln(cmd.OutOrStdout(), r)
	}
	return nil
}
