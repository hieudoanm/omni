package encode

import (
	"github.com/spf13/cobra"
)

func NewCmd() *cobra.Command {
	var file string
	var output string

	cmd := &cobra.Command{
		Use:   "encode [text]",
		Short: "Encode text/file to base64",
		Example: `  convert base64 encode "hello world"
  convert base64 encode --file photo.png
  convert base64 encode --file photo.png --out encoded.txt`,
		Args: cobra.MaximumNArgs(1),
		RunE: func(cmd *cobra.Command, args []string) error {
			return Run(cmd, args, file, output)
		},
	}

	cmd.Flags().StringVarP(&file, "file", "f", "", "File to encode (reads raw bytes to base64)")
	cmd.Flags().StringVarP(&output, "output", "o", "", "Write output to file instead of stdout")
	return cmd
}
