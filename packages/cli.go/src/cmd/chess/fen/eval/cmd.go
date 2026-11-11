package eval

import (
	"github.com/spf13/cobra"
)

func NewCmd() *cobra.Command {
	cmd := &cobra.Command{
		Use:   "eval",
		Short: "Evaluate a FEN position using Lichess cloud eval",
		Long:  `Fetch a cloud-based evaluation for a FEN position from Lichess, returning centipawn scores and principal variations.`,
		Example: `  chess fen eval --fen "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"
  chess fen eval --fen "..." --multipv 5`,
		RunE: runEval,
	}

	cmd.Flags().String("fen", "", "FEN string to evaluate (required)")
	cmd.Flags().Int("multipv", 3, "Number of principal variations")

	return cmd
}
