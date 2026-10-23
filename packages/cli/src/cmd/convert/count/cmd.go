package count

import (
	"github.com/spf13/cobra"
)

func NewCommand() *cobra.Command {
	cmd := &cobra.Command{
		Use:   "count <text>",
		Short: "Count characters, words, and lines in text",
		Long: `Count the number of characters, words, and lines in the provided text.
If no text is provided, reads from stdin.`,
		Example: `  convert count "hello world"
  convert count --json "the quick brown fox"
  echo "hello world" | convert count`,
		Args: cobra.MaximumNArgs(1),
		RunE: func(cmd *cobra.Command, args []string) error {
			return Run(cmd, args)
		},
	}

	return cmd
}
