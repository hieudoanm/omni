package create

import "github.com/spf13/cobra"

func NewCommand() *cobra.Command {
	cmd := &cobra.Command{
		Use:   "create",
		Short: "Create PDF from text",
		Long:  "Create a PDF document from text content provided via --text or --file.",
		Args:  cobra.MaximumNArgs(0),
		RunE: func(cmd *cobra.Command, args []string) error {
			return run(cmd)
		},
	}
	cmd.Flags().String("text", "", "Text content to include in PDF")
	cmd.Flags().String("file", "", "Read text from file")
	cmd.Flags().StringP("output", "o", "created.pdf", "Output PDF file path")
	return cmd
}
