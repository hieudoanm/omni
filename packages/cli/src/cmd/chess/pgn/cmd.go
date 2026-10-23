package pgn

import (
	"github.com/hieudoanm/omni/packages/cli/src/cmd/chess/pgn/fen"
	"github.com/hieudoanm/omni/packages/cli/src/cmd/chess/pgn/uci"
	"github.com/spf13/cobra"
)

func NewCmd() *cobra.Command {
	cmd := &cobra.Command{
		Use:   "pgn",
		Short: "PGN chess game analysis tools",
		Long:  `Convert PGN game notation to FEN positions per move, or extract UCI move sequences.`,
		Example: `  chess pgn fen --pgn-file game.pgn
  chess pgn uci --pgn "1.e4 e5 2.Nf3"`,
		RunE: func(cmd *cobra.Command, args []string) error { return cmd.Help() },
	}
	cmd.AddCommand(fen.NewCmd())
	cmd.AddCommand(uci.NewCmd())
	return cmd
}
