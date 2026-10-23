package barcode

import (
	"github.com/hieudoanm/omni/packages/cli/src/cmd/crypto/barcode/decode"
	"github.com/hieudoanm/omni/packages/cli/src/cmd/crypto/barcode/encode"
	"github.com/spf13/cobra"
)

func NewCommand() *cobra.Command {
	cmd := &cobra.Command{
		Use:   "barcode",
		Short: "Generate or decode 1D barcodes",
		Long:  `Generate or decode 1D barcodes in formats like Code 128, Code 39, EAN-13, and UPC-A. Output to terminal, PNG image, or decode from image.`,
		Example: `  crypto barcode encode "1234567890"
  crypto barcode encode --data "HELLO" --format code39
  crypto barcode encode --data "5901234123457" --format ean13 --output barcode.png
  crypto barcode decode barcode.png`,
		RunE: func(cmd *cobra.Command, args []string) error { return cmd.Help() },
	}
	cmd.AddCommand(encode.NewCommand())
	cmd.AddCommand(decode.NewCommand())
	return cmd
}
