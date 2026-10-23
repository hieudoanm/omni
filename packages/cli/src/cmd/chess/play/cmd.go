package play

import (
	"github.com/spf13/cobra"
)

func NewCmd() *cobra.Command {
	cmd := &cobra.Command{
		Use:   "play",
		Short: "Play chess interactively in the terminal",
		Long:  `Play a full chess game in your terminal with board display. Enter moves in SAN notation (e.g., e4, Nf3). Supports blind mode with --blind.`,
		Example: `  chess play
  chess play --blind`,
		RunE: runPlay,
	}

	cmd.Flags().Bool("blind", false, "Hide the board after each move")

	return cmd
}
