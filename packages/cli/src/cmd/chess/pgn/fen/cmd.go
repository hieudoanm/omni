package fen

import (
	"github.com/spf13/cobra"
)

func NewCmd() *cobra.Command {
	cmd := &cobra.Command{
		Use:   "fen",
		Short: "Convert PGN to FEN per move with evaluation",
		Long:  `Parse a PGN game and display each move with its resulting FEN, centipawn evaluation from Lichess cloud eval, and a quality label (Best/Good/Inaccuracy/Mistake/Blunder).`,
		Example: `  chess pgn fen --pgn-file game.pgn
  chess pgn fen --pgn "1.e4 e5 2.Nf3 Nc6"`,
		RunE: runFen,
	}

	cmd.Flags().String("pgn-file", "", "Path to a PGN file")
	cmd.Flags().String("pgn", "", "Raw PGN string")

	return cmd
}
