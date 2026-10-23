package fromimages

import "github.com/spf13/cobra"

func NewCommand() *cobra.Command {
	cmd := &cobra.Command{
		Use:   "from-images <files...>",
		Short: "Create PDF from images",
		Long:  "Create a PDF document from one or more image files.",
		Args:  cobra.MinimumNArgs(1),
		RunE: func(cmd *cobra.Command, args []string) error {
			return run(cmd, args)
		},
	}
	cmd.Flags().StringP("output", "o", "output.pdf", "Output PDF file path")
	return cmd
}
