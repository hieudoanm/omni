package fen

import (
	"github.com/hieudoanm/omni/packages/cli/src/cmd/chess/fen/eval"
	"github.com/hieudoanm/omni/packages/cli/src/cmd/chess/fen/svg"
	"github.com/spf13/cobra"
)

func NewCmd() *cobra.Command {
	cmd := &cobra.Command{
		Use:   "fen",
		Short: "FEN-based chess analysis tools",
		Long:  `Analyze FEN strings with cloud evaluation and render boards to SVG.`,
		Example: `  chess fen eval --fen "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"
  chess fen svg --fen "..." --out board.svg`,
		RunE: func(cmd *cobra.Command, args []string) error { return cmd.Help() },
	}

	cmd.AddCommand(eval.NewCmd())
	cmd.AddCommand(svg.NewCmd())
	cmd.Flags().BoolP("list", "l", false, "List popular chess platforms")

	return cmd
}
