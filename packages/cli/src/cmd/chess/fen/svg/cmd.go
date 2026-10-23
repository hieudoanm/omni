package svg

import (
	"github.com/spf13/cobra"
)

func NewCmd() *cobra.Command {
	cmd := &cobra.Command{
		Use:   "svg",
		Short: "Render a FEN position as an SVG board image",
		Long:  `Generate an SVG image of a chess board from a FEN string, with standard light/dark square colors.`,
		Example: `  chess fen svg --fen "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"
  chess fen svg --fen "..." --out board.svg`,
		RunE: runSvg,
	}

	cmd.Flags().String("fen", "", "FEN string to render")
	cmd.Flags().String("out", "", "Output SVG file (default: board.svg)")

	return cmd
}
