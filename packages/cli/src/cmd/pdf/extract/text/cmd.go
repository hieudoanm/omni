package text

import "github.com/spf13/cobra"

func NewCommand() *cobra.Command {
	cmd := &cobra.Command{
		Use:   "text <file>",
		Short: "Extract text from PDF",
		Long:  "Extract all text content from a PDF file and print to stdout.",
		Args:  cobra.ExactArgs(1),
		RunE: func(cmd *cobra.Command, args []string) error {
			return run(cmd, args[0])
		},
	}
	return cmd
}
