package titled

import (
	"github.com/spf13/cobra"
)

func NewCmd() *cobra.Command {
	return &cobra.Command{
		Use:     "titled",
		Short:   "Show Chess.com titled player counts",
		Long:    `Fetch and display the number of Chess.com players holding each title (GM, IM, FM, etc.).`,
		Example: `  chess com titled`,
		RunE:    runTitled,
	}
}
