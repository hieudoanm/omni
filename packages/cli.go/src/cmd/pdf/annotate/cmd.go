package annotate

import "github.com/spf13/cobra"

func NewCommand() *cobra.Command {
	cmd := &cobra.Command{
		Use:   "annotate <file>",
		Short: "Add text annotations to PDF",
		Long:  "Add text annotations (comments) to specific pages of a PDF file.",
		Args:  cobra.ExactArgs(1),
		RunE: func(cmd *cobra.Command, args []string) error {
			return run(cmd, args[0])
		},
	}
	cmd.Flags().StringP("text", "t", "", "Annotation text")
	cmd.Flags().Int("page", 1, "Page number for the annotation")
	cmd.Flags().Float64("x", 100, "X position in PDF points")
	cmd.Flags().Float64("y", 100, "Y position in PDF points")
	cmd.Flags().Int("size", 12, "Font size")
	cmd.Flags().StringP("output", "o", "", "Output file path (default: overwrite input)")
	return cmd
}
