package strategy

import (
	"github.com/spf13/cobra"
)

func NewCmd() *cobra.Command {
	var sims int

	cmd := &cobra.Command{
		Use:   "strategy",
		Short: "Baccarat strategy analysis and statistics",
		Long:  `Analyze baccarat odds and optimal betting strategy through simulation.`,
		Example: `  casino baccarat strategy
  casino baccarat strategy --simulations 50000`,
		RunE: func(cmd *cobra.Command, args []string) error {
			jsonOutput, _ := cmd.Flags().GetBool("json")
			return runStrategy(sims, jsonOutput)
		},
	}

	cmd.Flags().IntVarP(&sims, "simulations", "n", 100000, "Number of simulations")
	return cmd
}
