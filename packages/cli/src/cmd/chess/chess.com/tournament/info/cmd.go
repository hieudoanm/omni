package info

import (
	"github.com/spf13/cobra"
)

func NewCmd() *cobra.Command {
	var tournamentID string
	cmd := &cobra.Command{
		Use:     "info",
		Short:   "Show tournament info",
		Long:    `Fetch and display a tournament's details.`,
		Example: `  chess com tournament info --tournament -33rd-chesscom-quick-knockouts-1401-1600`,
		RunE:    runTournamentInfo,
	}
	cmd.Flags().StringVarP(&tournamentID, "tournament", "t", "", "Tournament URL ID")
	return cmd
}
