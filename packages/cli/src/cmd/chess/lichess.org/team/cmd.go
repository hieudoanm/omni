package team

import (
	"github.com/spf13/cobra"
)

func NewCmd() *cobra.Command {
	cmd := &cobra.Command{
		Use:     "team [team-id]",
		Short:   "Fetch team information",
		Args:    cobra.ExactArgs(1),
		Example: `  chess lichess team lichess-chess`,
		RunE:    runTeam,
	}

	cmd.Flags().Bool("json", false, "Output as JSON")

	return cmd
}
