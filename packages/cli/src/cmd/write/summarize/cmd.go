package summarize

import (
	"github.com/spf13/cobra"
)

func NewCmd() *cobra.Command {
	var file string
	var maxLength int

	cmd := &cobra.Command{
		Use:   "summarize [text]",
		Short: "Summarize text using AI",
		Long:  `Summarize the given text (or from a file) using AI via OpenRouter.`,
		Example: `  write summarize "Long article text here..."
  write summarize --file article.txt
  write summarize --max-length 200 < input.txt`,
		Args: cobra.MaximumNArgs(1),
		RunE: func(cmd *cobra.Command, args []string) error {
			return runE(args, file, maxLength)
		},
	}

	cmd.Flags().StringVar(&file, "file", "", "Read input from file")
	cmd.Flags().IntVar(&maxLength, "max-length", 100, "Maximum summary length in words")

	return cmd
}
