package grammar

import (
	"github.com/spf13/cobra"
)

func NewCmd() *cobra.Command {
	var file string

	cmd := &cobra.Command{
		Use:   "grammar [text]",
		Short: "Fix grammar in text using AI",
		Long:  `Check and fix grammar, spelling, and punctuation in the given text using AI.`,
		Example: `  write grammar "Their are mistakes here"
  write grammar --file draft.txt`,
		Args: cobra.MaximumNArgs(1),
		RunE: func(cmd *cobra.Command, args []string) error {
			return runE(args, file)
		},
	}

	cmd.Flags().StringVar(&file, "file", "", "Read input from file")

	return cmd
}
