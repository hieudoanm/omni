package watermark

import "github.com/spf13/cobra"

func NewCommand() *cobra.Command {
	cmd := &cobra.Command{
		Use:   "watermark <file>",
		Short: "Add watermark to PDF",
		Long:  "Add a text watermark to PDF pages (e.g. CONFIDENTIAL, DRAFT).",
		Args:  cobra.ExactArgs(1),
		RunE: func(cmd *cobra.Command, args []string) error {
			return run(cmd, args[0])
		},
	}
	cmd.Flags().StringP("text", "t", "DRAFT", "Watermark text")
	cmd.Flags().StringP("output", "o", "", "Output file path (default: overwrite input)")
	cmd.Flags().StringP("pages", "p", "1-", "Page range (default: all)")
	cmd.Flags().Float64("opacity", 0.5, "Opacity (0.0 - 1.0)")
	return cmd
}
