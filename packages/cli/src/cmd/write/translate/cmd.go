package translate

import (
	"github.com/spf13/cobra"
)

func NewCmd() *cobra.Command {
	var file string
	var target string

	cmd := &cobra.Command{
		Use:   "translate [text]",
		Short: "Translate text using AI",
		Long:  `Translate the given text to the target language using AI via OpenRouter.`,
		Example: `  write translate "Hello, how are you?" --target spanish
  write translate --file input.txt --target vietnamese`,
		Args: cobra.MaximumNArgs(1),
		RunE: func(cmd *cobra.Command, args []string) error {
			return runE(args, file, target)
		},
	}

	cmd.Flags().StringVar(&file, "file", "", "Read input from file")
	cmd.Flags().StringVar(&target, "target", "english", "Target language")

	return cmd
}
