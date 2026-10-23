package toimages

import "github.com/spf13/cobra"

func NewCommand() *cobra.Command {
	cmd := &cobra.Command{
		Use:   "to-images <file>",
		Short: "Export PDF pages as images",
		Long:  "Extract embedded images from a PDF file into a directory.",
		Args:  cobra.ExactArgs(1),
		RunE: func(cmd *cobra.Command, args []string) error {
			return run(cmd, args[0])
		},
	}
	cmd.Flags().String("format", "png", "Output image format (png or jpg)")
	cmd.Flags().Int("dpi", 150, "Image resolution in DPI")
	cmd.Flags().StringP("output", "o", "", "Output directory (default: <file>_images/)")
	return cmd
}
