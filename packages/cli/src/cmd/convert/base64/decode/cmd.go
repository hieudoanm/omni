package decode

import (
	"github.com/spf13/cobra"
)

func NewCmd() *cobra.Command {
	var file string
	var output string

	cmd := &cobra.Command{
		Use:   "decode [text]",
		Short: "Decode base64 to text/file",
		Example: `  convert base64 decode "aGVsbG8gd29ybGQ="
  convert base64 decode --file encoded.txt
  convert base64 decode --file encoded.txt --output decoded.jpg`,
		Args: cobra.MaximumNArgs(1),
		RunE: func(cmd *cobra.Command, args []string) error {
			return Run(cmd, args, file, output)
		},
	}

	cmd.Flags().StringVarP(&file, "file", "f", "", "File containing base64 to decode")
	cmd.Flags().StringVarP(&output, "output", "o", "", "Write decoded output to file instead of stdout")
	return cmd
}
