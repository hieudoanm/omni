package delete

import "github.com/spf13/cobra"

func NewCommand() *cobra.Command {
	cmd := &cobra.Command{
		Use:   "delete <file>",
		Short: "Delete specific pages",
		Long:  "Remove specific pages from a PDF file.",
		Args:  cobra.ExactArgs(1),
		RunE: func(cmd *cobra.Command, args []string) error {
			return run(cmd, args[0])
		},
	}
	cmd.Flags().StringP("pages", "p", "", "Pages to delete (e.g. 1,3,5-7)")
	cmd.Flags().StringP("output", "o", "", "Output file path (default: overwrite input)")
	return cmd
}
