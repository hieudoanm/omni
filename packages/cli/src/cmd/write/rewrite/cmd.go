package rewrite

import (
	"github.com/spf13/cobra"
)

func NewCmd() *cobra.Command {
	var file string
	var style string

	cmd := &cobra.Command{
		Use:   "rewrite [text]",
		Short: "Rewrite or paraphrase text using AI",
		Long:  `Rewrite the given text in a different tone or style using AI.`,
		Example: `  write rewrite "Original text here"
  write rewrite --file input.txt --style formal
  write rewrite --style concise`,
		Args: cobra.MaximumNArgs(1),
		RunE: func(cmd *cobra.Command, args []string) error {
			return runE(args, file, style)
		},
	}

	cmd.Flags().StringVar(&file, "file", "", "Read input from file")
	cmd.Flags().StringVar(&style, "style", "professional", "Writing style (professional, casual, formal, concise)")

	return cmd
}
