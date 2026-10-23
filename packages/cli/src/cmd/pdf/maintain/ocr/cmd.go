package ocr

import "github.com/spf13/cobra"

func NewCommand() *cobra.Command {
	cmd := &cobra.Command{
		Use:   "ocr <file>",
		Short: "Run OCR on a PDF",
		Long:  "Run Tesseract OCR on a PDF file and output recognized text. Requires tesseract to be installed.",
		Args:  cobra.ExactArgs(1),
		RunE: func(cmd *cobra.Command, args []string) error {
			return run(cmd, args[0])
		},
	}
	cmd.Flags().StringP("language", "l", "eng", "OCR language (e.g. eng, vie, fra)")
	cmd.Flags().StringP("output", "o", "", "Output file (default: stdout)")
	return cmd
}
