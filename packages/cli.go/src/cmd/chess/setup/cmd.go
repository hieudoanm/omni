package setup

import (
	"github.com/spf13/cobra"
)

func NewCmd() *cobra.Command {
	return &cobra.Command{
		Use:   "setup",
		Short: "Set up a specific Chess960 starting position",
		Long:  `Select a Chess960 starting position by number, display the FEN, and fetch a cloud evaluation from Lichess.`,
		Example: `  chess setup
  chess setup 518`,
		RunE: runSetup,
	}
}
