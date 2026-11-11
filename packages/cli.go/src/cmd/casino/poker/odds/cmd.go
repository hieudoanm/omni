package odds

import (
	"github.com/spf13/cobra"
)

func NewCmd() *cobra.Command {
	var hand string

	cmd := &cobra.Command{
		Use:   "odds [--hand <hole>]",
		Short: "Calculate Texas Hold'em poker odds",
		Long: `Calculate win/tie/lose odds using Monte Carlo simulation for Texas Hold'em.

Hole cards are required (e.g. "Ah Kh" or "As Ks").
Use --board to specify community cards (0-5 cards).`,
		Example: `  casino poker odds --hand "Ah Kh"
  casino poker odds --hand "Ah Kh" --board "2h 7s Tc"
  casino poker odds --hand "As Ks" --board "2h 7s Tc" --opponents 3`,
		RunE: func(cmd *cobra.Command, args []string) error {
			jsonOutput, _ := cmd.Flags().GetBool("json")
			return runOdds(hand, boardStr, numOpponents, numSimulations, jsonOutput)
		},
	}

	cmd.Flags().StringVarP(&hand, "hand", "H", "", "Hole cards (e.g. \"Ah Kh\")")
	cmd.Flags().StringVarP(&boardStr, "board", "b", "", "Community cards (e.g. \"2h 7s Tc\")")
	cmd.Flags().IntVarP(&numOpponents, "opponents", "o", 1, "Number of opponents")
	cmd.Flags().IntVarP(&numSimulations, "simulations", "n", 10000, "Number of Monte Carlo simulations")
	return cmd
}
