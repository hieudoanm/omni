package images

import "github.com/spf13/cobra"

func NewCommand() *cobra.Command {
	cmd := &cobra.Command{
		Use:   "images <file>",
		Short: "Extract images from PDF",
		Long:  "Extract all embedded images from a PDF file into a directory.",
		Args:  cobra.ExactArgs(1),
		RunE: func(cmd *cobra.Command, args []string) error {
			return run(cmd, args[0])
		},
	}
	cmd.Flags().StringP("output", "o", "", "Output directory (default: <file>_images/)")
	cmd.Flags().IntP("resolution", "r", 150, "Image resolution in DPI")
	return cmd
}
