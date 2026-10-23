package encode

import (
	"encoding/base64"
	"fmt"
	"os"

	"github.com/hieudoanm/omni/packages/cli/src/cmd/convert/internal"
	"github.com/spf13/cobra"
)

type encodeResult struct {
	Output string `json:"output"`
}

func Run(cmd *cobra.Command, args []string, file, output string) error {
	var data []byte
	if file != "" {
		var err error
		data, err = os.ReadFile(file)
		if err != nil {
			return err
		}
	} else {
		text, err := internal.ResolveText(args)
		if err != nil {
			return err
		}
		data = []byte(text)
	}
	encoded := base64.StdEncoding.EncodeToString(data)
	if output != "" {
		if err := os.WriteFile(output, []byte(encoded), 0644); err != nil {
			return err
		}
	} else {
		useJSON, _ := cmd.Flags().GetBool("json")
		if useJSON {
			return internal.WriteJSON(cmd, encodeResult{Output: encoded})
		}
		fmt.Fprintln(cmd.OutOrStdout(), encoded)
	}
	return nil
}
