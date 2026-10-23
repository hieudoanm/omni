package decode

import (
	"github.com/spf13/cobra"
)

func NewCommand() *cobra.Command {
	cmd := &cobra.Command{
		Use:   "decode <image>",
		Short: "Decode a QR code from an image",
		Long:  `Read a QR code from a PNG or JPEG image and print the decoded text.`,
		Example: `  crypto qrcode decode qr.png
  crypto qrcode decode --json qr.png`,
		Args: cobra.ExactArgs(1),
		RunE: func(cmd *cobra.Command, args []string) error {
			jsonOutput, _ := cmd.Flags().GetBool("json")
			return runDecode(args[0], jsonOutput)
		},
	}
	return cmd
}
