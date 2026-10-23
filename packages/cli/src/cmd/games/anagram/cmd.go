package anagram

import (
	"github.com/spf13/cobra"
)

func NewCommand() *cobra.Command {
	return &cobra.Command{
		Use:   "anagram",
		Short: "Unscramble the letters to form a word",
		Long:  `A word is scrambled and you have to guess the original word. Keep going as long as you want.`,
		RunE: func(cmd *cobra.Command, args []string) error {
			return runAnagram()
		},
	}
}
