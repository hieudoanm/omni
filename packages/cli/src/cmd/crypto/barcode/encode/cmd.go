package encode

import (
	"github.com/spf13/cobra"
)

func NewCommand() *cobra.Command {
	var data, inputFile, outputFile, format string
	var width, height, margin int

	cmd := &cobra.Command{
		Use:   "encode [data]",
		Short: "Generate a 1D barcode in the terminal or as a PNG image",
		Long:  "Generate a 1D barcode (Code 128, Code 39, EAN-13, UPC-A, etc.) and display it in the terminal or save it as a PNG image.",
		Example: `  crypto barcode encode "1234567890"
  crypto barcode encode --data "HELLO" --format code39 --output barcode.png
  crypto barcode encode "5901234123457" --format ean13 --width 300 --height 100`,
		Args: cobra.MaximumNArgs(1),
		RunE: func(cmd *cobra.Command, args []string) error {
			jsonOutput, _ := cmd.Flags().GetBool("json")
			if len(args) > 0 && data == "" {
				data = args[0]
			}
			return runBarcode(data, jsonOutput, inputFile, outputFile, format, width, height, margin)
		},
	}

	cmd.Flags().StringVarP(&data, "data", "d", "", "Text or data to encode")
	cmd.Flags().StringVarP(&inputFile, "input", "i", "", "Read data from file")
	cmd.Flags().StringVarP(&outputFile, "output", "o", "", "Save barcode as PNG image")
	cmd.Flags().StringVarP(&format, "format", "f", "code128", "Barcode format (code128, code39, ean13, ean8, upca, upce, codabar, itf, code93)")
	cmd.Flags().IntVarP(&width, "width", "w", 400, "Image width in pixels")
	cmd.Flags().IntVarP(&height, "height", "H", 150, "Image height in pixels")
	cmd.Flags().IntVarP(&margin, "margin", "m", 10, "Margin in pixels")
	return cmd
}
