package liveboard

import (
	"github.com/spf13/cobra"
)

func NewCmd() *cobra.Command {
	var id string
	var board int
	cmd := &cobra.Command{
		Use:     "live-board",
		Short:   "Show live team match board",
		Long:    `Fetch and display a live team match board's details.`,
		Example: `  chess com match live-board --id 5833 --board 5`,
		RunE:    runLiveBoard,
	}
	cmd.Flags().StringVar(&id, "id", "", "Match ID")
	cmd.Flags().IntVarP(&board, "board", "b", 0, "Board number")
	return cmd
}
