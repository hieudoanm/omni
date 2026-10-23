package redact

import "github.com/spf13/cobra"

func NewCommand() *cobra.Command {
	cmd := &cobra.Command{
		Use:   "redact <file>",
		Short: "Redact PDF content",
		Long:  "Redact pages or regions from a PDF by covering them with black rectangles.",
		Args:  cobra.ExactArgs(1),
		RunE: func(cmd *cobra.Command, args []string) error {
			return run(cmd, args[0])
		},
	}
	cmd.Flags().StringP("pages", "p", "", "Comma-separated page numbers/ranges to redact (e.g. 1,3-5)")
	cmd.Flags().StringSliceP("region", "r", nil, "Region to redact in format page:x,y,w,h (repeatable, e.g. -r 1:10,10,200,50)")
	cmd.Flags().StringP("output", "o", "", "Output file path (default: <file>.redacted.pdf)")
	return cmd
}
