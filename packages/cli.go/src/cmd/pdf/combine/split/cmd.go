package split

import "github.com/spf13/cobra"

func NewCommand() *cobra.Command {
	cmd := &cobra.Command{
		Use:   "split <file>",
		Short: "Split PDF into separate pages",
		Long:  "Split a PDF file into individual pages or page ranges.",
		Args:  cobra.ExactArgs(1),
		RunE: func(cmd *cobra.Command, args []string) error {
			return run(cmd, args[0])
		},
	}
	cmd.Flags().StringP("pages", "p", "", "Page ranges to extract (e.g. 1-3,5,7-9)")
	cmd.Flags().StringP("output", "o", "", "Output directory (default: <file>_split/)")
	return cmd
}
