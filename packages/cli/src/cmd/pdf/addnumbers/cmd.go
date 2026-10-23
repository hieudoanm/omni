package addnumbers

import "github.com/spf13/cobra"

func NewCommand() *cobra.Command {
	cmd := &cobra.Command{
		Use:   "add-numbers <file>",
		Short: "Add page numbers to PDF",
		Long:  "Add page numbers to a PDF file with configurable format and position.",
		Args:  cobra.ExactArgs(1),
		RunE: func(cmd *cobra.Command, args []string) error {
			return run(cmd, args[0])
		},
	}
	cmd.Flags().String("format", "Page {n} of {total}", `Page number format ({n}=number, {total}=total)`)
	cmd.Flags().Int("start", 1, "Starting page number")
	cmd.Flags().String("position", "bottom-center", "Position: top-left, top-center, top-right, bottom-left, bottom-center, bottom-right")
	cmd.Flags().StringP("output", "o", "", "Output file path (default: overwrite input)")
	return cmd
}
