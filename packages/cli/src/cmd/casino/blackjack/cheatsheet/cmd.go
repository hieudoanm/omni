package cheatsheet

import (
	"github.com/spf13/cobra"
)

func NewCmd() *cobra.Command {
	return &cobra.Command{
		Use:     "cheatsheet",
		Aliases: []string{"cs", "strategy"},
		Short:   "Display basic blackjack strategy",
		Long: `Display basic blackjack strategy with hard totals, soft totals, and pair splitting charts.

  H = Hit    S = Stand    D = Double    P = Split

  Based on standard H17 (dealer hits soft 17) rules with 6+ decks.`,
		Example: `  casino blackjack cheatsheet`,
		RunE: func(cmd *cobra.Command, args []string) error {
			return runCheatsheet()
		},
	}
}
