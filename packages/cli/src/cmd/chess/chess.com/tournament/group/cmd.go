package group

import (
	"github.com/spf13/cobra"
)

func NewCmd() *cobra.Command {
	var tournamentID string
	var roundNum, groupNum int
	cmd := &cobra.Command{
		Use:     "group",
		Short:   "Show tournament round group",
		Long:    `Fetch and display a tournament round group's details.`,
		Example: `  chess com tournament group --tournament -33rd-chesscom-quick-knockouts-1401-1600 --round 1 --group 1`,
		RunE:    runTournamentGroup,
	}
	cmd.Flags().StringVarP(&tournamentID, "tournament", "t", "", "Tournament URL ID")
	cmd.Flags().IntVarP(&roundNum, "round", "r", 0, "Round number")
	cmd.Flags().IntVarP(&groupNum, "group", "g", 0, "Group number")
	return cmd
}
