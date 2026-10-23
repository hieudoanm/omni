package percent

import (
	"github.com/spf13/cobra"
)

func NewCmd() *cobra.Command {
	var value, of, plus, minus float64

	cmd := &cobra.Command{
		Use:   "percent",
		Short: "Calculate percentages",
		Long:  `Calculate what percent one number is of another, or add/subtract a percentage.`,
		Example: `  calc percent --value 20 --of 50
  calc percent --value 50 --plus 20
  calc percent --value 50 --minus 20`,
		RunE: func(cmd *cobra.Command, args []string) error {
			jsonOutput, _ := cmd.Flags().GetBool("json")
			return runPercent(value, of, plus, minus, jsonOutput)
		},
	}

	cmd.Flags().Float64VarP(&value, "value", "v", 0, "Base value")
	cmd.Flags().Float64VarP(&of, "of", "o", 0, "Calculate what % value is of this")
	cmd.Flags().Float64VarP(&plus, "plus", "p", 0, "Add percentage")
	cmd.Flags().Float64VarP(&minus, "minus", "m", 0, "Subtract percentage")
	cmd.Flags().Bool("json", false, "Output in JSON format")
	return cmd
}
