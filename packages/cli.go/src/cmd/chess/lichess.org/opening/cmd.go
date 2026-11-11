package opening

import (
	"github.com/spf13/cobra"
)

func NewCmd() *cobra.Command {
	cmd := &cobra.Command{
		Use:     "opening [fen]",
		Short:   "Masters opening explorer",
		Long:    `Query the Lichess masters opening explorer for a position.`,
		Args:    cobra.ExactArgs(1),
		Example: `  chess lichess opening "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"`,
		RunE:    runOpening,
	}

	cmd.Flags().Bool("json", false, "Output as JSON")

	return cmd
}
