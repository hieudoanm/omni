package random

import (
	"github.com/spf13/cobra"
)

func NewCmd() *cobra.Command {
	return &cobra.Command{
		Use:     "random",
		Short:   "Pick a random Chess960 starting position",
		Long:    `Select a random Chess960 starting position, display the FEN, and fetch a cloud evaluation from Lichess.`,
		Example: `  chess chess960 random`,
		RunE:    runRandom,
	}
}
