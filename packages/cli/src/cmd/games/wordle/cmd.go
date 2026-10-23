package wordle

import (
	"github.com/spf13/cobra"
)

func NewCommand() *cobra.Command {
	cmd := &cobra.Command{
		Use:   "wordle",
		Short: "Play Wordle - guess the 5-letter word",
		Long: `A terminal-based Wordle game. You have 6 attempts to guess a 5-letter word.
After each guess, letters are colored:
  green  = correct letter in correct position
  yellow = correct letter in wrong position
  gray   = letter not in the word`,
		RunE: func(cmd *cobra.Command, args []string) error {
			jsonOutput, _ := cmd.Flags().GetBool("json")
			return runWordle(jsonOutput)
		},
	}
	cmd.Flags().Bool("json", false, "Output game result as JSON")
	return cmd
}
