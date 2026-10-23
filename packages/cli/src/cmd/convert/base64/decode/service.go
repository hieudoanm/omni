package decode

import (
	"encoding/base64"
	"fmt"
	"os"
	"strings"

	"github.com/hieudoanm/omni/packages/cli/src/cmd/convert/internal"
	"github.com/spf13/cobra"
)

type decodeResult struct {
	Output string `json:"output"`
}

func stripDataURL(s string) string {
	if idx := strings.Index(s, "base64,"); idx != -1 {
		return s[idx+7:]
	}
	return s
}

func decodeBase64(input []byte) ([]byte, error) {
	raw := strings.TrimSpace(string(input))
	raw = strings.ReplaceAll(raw, "\n", "")
	raw = stripDataURL(raw)
	return base64.StdEncoding.DecodeString(raw)
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
	decoded, err := decodeBase64(data)
	if err != nil {
		return err
	}
	if output != "" {
		if err := os.WriteFile(output, decoded, 0644); err != nil {
			return err
		}
	} else {
		useJSON, _ := cmd.Flags().GetBool("json")
		if useJSON {
			return internal.WriteJSON(cmd, decodeResult{Output: string(decoded)})
		}
		fmt.Fprintln(cmd.OutOrStdout(), string(decoded))
	}
	return nil
}
