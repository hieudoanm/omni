package lorem

import "github.com/spf13/cobra"

func NewCommand() *cobra.Command {
	cmd := &cobra.Command{
		Use:   "lorem",
		Short: "Generate Lorem Ipsum placeholder text",
		Long:  "Generate classic Lorem Ipsum placeholder text with configurable paragraphs or word count.",
		Example: `  convert lorem
  convert lorem --paragraphs 5
  convert lorem --words 50`,
		Args: cobra.NoArgs,
		RunE: func(cmd *cobra.Command, args []string) error {
			return Run(cmd, args)
		},
	}

	cmd.Flags().IntP("paragraphs", "p", 3, "Number of paragraphs to generate")
	cmd.Flags().IntP("words", "w", 0, "Number of words to generate (overrides --paragraphs)")
	return cmd
}
