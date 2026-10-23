package encode

import (
	"github.com/spf13/cobra"
)

func NewCommand() *cobra.Command {
	var data, inputFile, outputFile, level string
	var quietZone int
	var invert bool

	cmd := &cobra.Command{
		Use:   "encode [data]",
		Short: "Generate a QR code in the terminal or as a PNG image",
		Long:  `Generate a QR code from text and display it in the terminal using Unicode block characters, or save it as a PNG image.`,
		Example: `  crypto qrcode encode "https://example.com"
  crypto qrcode encode --data "Hello, World!"
  crypto qrcode encode --input file.txt --output qr.png
  crypto qrcode encode "https://example.com" --level H --quiet-zone 2 --invert`,
		Args: cobra.MaximumNArgs(1),
		RunE: func(cmd *cobra.Command, args []string) error {
			jsonOutput, _ := cmd.Flags().GetBool("json")
			if len(args) > 0 && data == "" {
				data = args[0]
			}
			return runQRCode(data, jsonOutput, inputFile, outputFile, level, quietZone, invert)
		},
	}

	cmd.Flags().StringVarP(&data, "data", "d", "", "Text or data to encode")
	cmd.Flags().StringVarP(&inputFile, "input", "i", "", "Read data from file")
	cmd.Flags().StringVarP(&outputFile, "output", "o", "", "Save QR code as PNG image")
	cmd.Flags().StringVarP(&level, "level", "l", "M", "Error correction level (L, M, Q, H)")
	cmd.Flags().IntVarP(&quietZone, "quiet-zone", "z", 1, "Quiet zone size in modules")
	cmd.Flags().BoolVarP(&invert, "invert", "v", false, "Invert QR code colors")
	return cmd
}
