package merge

import "github.com/spf13/cobra"

func NewCommand() *cobra.Command {
	cmd := &cobra.Command{
		Use:   "merge <file1> <file2> [files...]",
		Short: "Merge multiple PDFs into one",
		Long:  "Combine multiple PDF files into a single PDF document.",
		Args:  cobra.MinimumNArgs(2),
		RunE: func(cmd *cobra.Command, args []string) error {
			return run(cmd, args)
		},
	}
	cmd.Flags().StringP("output", "o", "merged.pdf", "Output file path")
	return cmd
}
