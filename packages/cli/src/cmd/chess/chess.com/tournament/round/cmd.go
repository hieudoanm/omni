package round

import (
	"github.com/spf13/cobra"
)

func NewCmd() *cobra.Command {
	var tournamentID string
	var roundNum int
	cmd := &cobra.Command{
		Use:     "round",
		Short:   "Show tournament round",
		Long:    `Fetch and display a tournament round's details.`,
		Example: `  chess com tournament round --tournament -33rd-chesscom-quick-knockouts-1401-1600 --round 1`,
		RunE:    runTournamentRound,
	}
	cmd.Flags().StringVarP(&tournamentID, "tournament", "t", "", "Tournament URL ID")
	cmd.Flags().IntVarP(&roundNum, "round", "r", 0, "Round number")
	return cmd
}
