package random

import (
	"github.com/spf13/cobra"
)

func NewCmd() *cobra.Command {
	var min, max float64
	var count int

	cmd := &cobra.Command{
		Use:   "random",
		Short: "Generate random numbers",
		Long:  `Generate random integers or floats within a range.`,
		Example: `  calc random --min 1 --max 100
  calc random --min 1 --max 100 --count 5
  calc random --min 0 --max 1 --float --count 3`,
		RunE: func(cmd *cobra.Command, args []string) error {
			jsonOutput, _ := cmd.Flags().GetBool("json")
			return runRandom(min, max, count, jsonOutput)
		},
	}

	cmd.Flags().Float64VarP(&min, "min", "m", 1, "Minimum value")
	cmd.Flags().Float64VarP(&max, "max", "x", 100, "Maximum value")
	cmd.Flags().IntVarP(&count, "count", "n", 1, "Number of values")
	cmd.Flags().Bool("json", false, "Output in JSON format")
	return cmd
}
