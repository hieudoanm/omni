package tablebase

import (
	"github.com/spf13/cobra"
)

func NewCmd() *cobra.Command {
	cmd := &cobra.Command{
		Use:     "tablebase [fen]",
		Short:   "Syzygy tablebase lookup for endgame positions",
		Long:    `Look up a position with 7 or fewer pieces in the Syzygy tablebase.`,
		Args:    cobra.ExactArgs(1),
		Example: `  chess lichess tablebase "4k3/8/8/8/8/8/8/4K3 w - - 0 1"`,
		RunE:    runTablebase,
	}

	cmd.Flags().Bool("json", false, "Output as JSON")

	return cmd
}
