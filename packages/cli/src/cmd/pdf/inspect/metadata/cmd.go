package metadata

import "github.com/spf13/cobra"

func NewCommand() *cobra.Command {
	cmd := &cobra.Command{
		Use:   "metadata <file>",
		Short: "View or set PDF metadata",
		Long:  "Display or update PDF document metadata (title, author, subject, keywords).",
		Args:  cobra.ExactArgs(1),
		RunE: func(cmd *cobra.Command, args []string) error {
			return run(cmd, args[0])
		},
	}
	cmd.Flags().String("title", "", "Set document title")
	cmd.Flags().String("author", "", "Set document author")
	cmd.Flags().String("subject", "", "Set document subject")
	cmd.Flags().String("keywords", "", "Set document keywords")
	return cmd
}
