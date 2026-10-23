package dailyboard

import (
	"github.com/spf13/cobra"
)

func NewCmd() *cobra.Command {
	var id string
	var board int
	cmd := &cobra.Command{
		Use:     "daily-board",
		Short:   "Show daily team match board",
		Long:    `Fetch and display a daily team match board's details.`,
		Example: `  chess com match daily-board --id 12803 --board 1`,
		RunE:    runDailyBoard,
	}
	cmd.Flags().StringVar(&id, "id", "", "Match ID")
	cmd.Flags().IntVarP(&board, "board", "b", 0, "Board number")
	return cmd
}
