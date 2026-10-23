package uci

import (
	"github.com/spf13/cobra"
)

func NewCmd() *cobra.Command {
	cmd := &cobra.Command{
		Use:   "uci",
		Short: "Convert PGN moves to UCI notation",
		Long:  `Parse a PGN game and output the moves as a space-separated UCI (Universal Chess Interface) string.`,
		Example: `  chess pgn uci --pgn-file game.pgn
  chess pgn uci --pgn "1.e4 e5 2.Nf3 Nc6 3.Bb5"`,
		RunE: runUci,
	}

	cmd.Flags().String("pgn-file", "", "Path to a PGN file")
	cmd.Flags().String("pgn", "", "Raw PGN string")

	return cmd
}
