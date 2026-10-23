package qrcode

import (
	"github.com/hieudoanm/omni/packages/cli/src/cmd/crypto/qrcode/decode"
	"github.com/hieudoanm/omni/packages/cli/src/cmd/crypto/qrcode/encode"
	"github.com/spf13/cobra"
)

func NewCommand() *cobra.Command {
	cmd := &cobra.Command{
		Use:   "qrcode",
		Short: "Encode or decode QR codes",
		Long:  `Encode text into a QR code or decode a QR code image back to text.`,
		Example: `  crypto qrcode encode "https://example.com"
  crypto qrcode encode --data "hello" --output qr.png
  crypto qrcode decode qr.png`,
		RunE: func(cmd *cobra.Command, args []string) error { return cmd.Help() },
	}
	cmd.AddCommand(encode.NewCommand())
	cmd.AddCommand(decode.NewCommand())
	return cmd
}
