package coin

import (
	"github.com/spf13/cobra"
)

func NewCmd() *cobra.Command {
	var count int
	cmd := &cobra.Command{
		Use:   "coin",
		Short: "Flip a coin",
		Long: `Simulate flipping one or more coins and display the results.

Shows heads/tails distribution when flipping multiple coins.`,
		Example: `  casino coin
  casino coin --count 10`,
		RunE: func(cmd *cobra.Command, args []string) error {
			jsonOutput, _ := cmd.Flags().GetBool("json")
			return runCoin(count, jsonOutput)
		},
	}
	cmd.Flags().IntVarP(&count, "count", "n", 1, "Number of coin flips")
	return cmd
}
