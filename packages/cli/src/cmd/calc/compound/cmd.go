package compound

import (
	"github.com/spf13/cobra"
)

func NewCmd() *cobra.Command {
	var principal, rate, years, contribute float64
	var compound string

	cmd := &cobra.Command{
		Use:   "compound",
		Short: "Compound interest calculator",
		Long: `Calculate compound interest with optional regular contributions.

Uses the formula: A = P(1+r/n)^(nt) + PMT * ((1+r/n)^(nt) - 1) / (r/n)`,
		Example: `  calc compound --principal 10000 --rate 5 --years 10 --compound monthly
  calc compound -p 50000 -r 7.5 -y 20 -n yearly -c 500`,
		RunE: func(cmd *cobra.Command, args []string) error {
			jsonOutput, _ := cmd.Flags().GetBool("json")
			return runCompound(principal, rate, years, contribute, compound, jsonOutput)
		},
	}

	cmd.Flags().Float64VarP(&principal, "principal", "p", 0, "Initial principal amount")
	cmd.Flags().Float64VarP(&rate, "rate", "r", 0, "Annual interest rate (percentage)")
	cmd.Flags().Float64VarP(&years, "years", "y", 0, "Number of years")
	cmd.Flags().Float64VarP(&contribute, "contribute", "c", 0, "Regular contribution per compounding period")
	cmd.Flags().StringVarP(&compound, "compound", "n", "yearly", "Compounding frequency: yearly, quarterly, monthly, daily")
	cmd.Flags().Bool("json", false, "Output in JSON format")

	return cmd
}
