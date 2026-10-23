package decode

import (
	"github.com/spf13/cobra"
)

func NewCommand() *cobra.Command {
	cmd := &cobra.Command{
		Use:   "decode <image>",
		Short: "Decode a 1D barcode from an image",
		Long:  "Read a 1D barcode (Code 128, Code 39, EAN-13, UPC-A, etc.) from a PNG or JPEG image and print the decoded text.",
		Example: `  crypto barcode decode barcode.png
  crypto barcode decode --json barcode.png`,
		Args: cobra.ExactArgs(1),
		RunE: func(cmd *cobra.Command, args []string) error {
			jsonOutput, _ := cmd.Flags().GetBool("json")
			return runDecode(args[0], jsonOutput)
		},
	}
	return cmd
}
