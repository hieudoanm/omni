package slots

import (
	"github.com/spf13/cobra"
)

func NewCmd() *cobra.Command {
	cmd := &cobra.Command{
		Use:     "slots",
		Short:   "Slot machine games",
		Long:    `Slot machine subcommands: play a slot machine game.`,
		Example: `  casino slots play`,
		RunE:    func(cmd *cobra.Command, args []string) error { return cmd.Help() },
	}
	cmd.AddCommand(newSlotsPlayCmd())
	return cmd
}

func newSlotsPlayCmd() *cobra.Command {
	var bet, spins int

	cmd := &cobra.Command{
		Use:   "play",
		Short: "Play a slot machine",
		Long:  `Play a slot machine. Three reels with symbols: Cherry, Lemon, Bell, Diamond, 7, BAR. Match three of a kind to win.`,
		Example: `  casino slots play
  casino slots play --bet 50
  casino slots play --bet 10 --spins 5`,
		RunE: func(cmd *cobra.Command, args []string) error {
			jsonOutput, _ := cmd.Flags().GetBool("json")
			return runSlotsPlay(bet, spins, jsonOutput)
		},
	}

	cmd.Flags().IntVarP(&bet, "bet", "b", 25, "Bet amount per spin")
	cmd.Flags().IntVarP(&spins, "spins", "n", 1, "Number of spins")
	return cmd
}
