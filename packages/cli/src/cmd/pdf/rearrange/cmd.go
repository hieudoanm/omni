package rearrange

import "github.com/spf13/cobra"

func NewCommand() *cobra.Command {
	cmd := &cobra.Command{
		Use:   "rearrange <file>",
		Short: "Reorder pages in PDF",
		Long:  "Rearrange pages in a PDF file by specifying a new order or using 'reverse'.",
		Args:  cobra.ExactArgs(1),
		RunE: func(cmd *cobra.Command, args []string) error {
			return run(cmd, args[0])
		},
	}
	cmd.Flags().StringP("order", "o", "", "Page order (e.g. 3,1,2 or 'reverse')")
	cmd.Flags().StringP("output", "O", "", "Output file path")
	return cmd
}
