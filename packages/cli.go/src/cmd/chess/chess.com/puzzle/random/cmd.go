package randompuzzle

import (
	"github.com/spf13/cobra"
)

func NewCmd() *cobra.Command {
	return &cobra.Command{
		Use:     "random",
		Short:   "Show random puzzle",
		Long:    `Fetch and display a randomly selected daily puzzle from Chess.com.`,
		Example: `  chess com puzzle random`,
		RunE:    runRandomPuzzle,
	}
}
