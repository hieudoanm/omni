package dice

import (
	"github.com/spf13/cobra"
)

func NewCmd() *cobra.Command {
	var sides, count int
	cmd := &cobra.Command{
		Use:   "dice",
		Short: "Roll dice",
		Long: `Roll one or more dice with a configurable number of sides.

Shows individual die results and the total when rolling multiple dice.`,
		Example: `  casino dice
  casino dice --sides 20
  casino dice --count 4 --sides 6`,
		RunE: func(cmd *cobra.Command, args []string) error {
			jsonOutput, _ := cmd.Flags().GetBool("json")
			return runDice(sides, count, jsonOutput)
		},
	}
	cmd.Flags().IntVarP(&sides, "sides", "s", 6, "Number of sides per die")
	cmd.Flags().IntVarP(&count, "count", "n", 1, "Number of dice to roll")
	return cmd
}
