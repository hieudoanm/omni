package count

import (
	"github.com/spf13/cobra"
)

func NewCmd() *cobra.Command {
	var cards int

	cmd := &cobra.Command{
		Use:   "count",
		Short: "Practice Hi-Lo card counting",
		Long:  `Practice the Hi-Lo card counting system. Cards 2-6 are +1, 7-9 are 0, and 10-A are -1. Displays a shuffled deck one card at a time.`,
		Example: `  casino blackjack count
  casino blackjack count --cards 13`,
		RunE: func(cmd *cobra.Command, args []string) error {
			jsonOutput, _ := cmd.Flags().GetBool("json")
			return runCount(cards, jsonOutput)
		},
	}

	cmd.Flags().IntVarP(&cards, "cards", "n", 13, "Number of cards to deal")
	return cmd
}
