package rotate

import "github.com/spf13/cobra"

func NewCommand() *cobra.Command {
	cmd := &cobra.Command{
		Use:   "rotate <file>",
		Short: "Rotate PDF pages",
		Long:  "Rotate pages in a PDF by 90, 180, or 270 degrees.",
		Args:  cobra.ExactArgs(1),
		RunE: func(cmd *cobra.Command, args []string) error {
			return run(cmd, args[0])
		},
	}
	cmd.Flags().IntP("angle", "a", 90, "Rotation angle (90, 180, 270)")
	cmd.Flags().StringP("pages", "p", "1-", "Page range to rotate (default: all)")
	cmd.Flags().StringP("output", "o", "", "Output file path (default: overwrite input)")
	return cmd
}
