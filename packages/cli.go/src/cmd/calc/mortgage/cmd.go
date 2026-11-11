package mortgage

import (
	"github.com/spf13/cobra"
)

func NewCmd() *cobra.Command {
	var principal, rate, years, taxes, insurance, pmi float64

	cmd := &cobra.Command{
		Use:   "mortgage",
		Short: "Mortgage payment calculator",
		Long:  `Calculate monthly mortgage payments including taxes, insurance, and PMI.`,
		Example: `  calc mortgage --principal 300000 --rate 6.5 --years 30
  calc mortgage -p 300000 -r 6.5 -y 30 --taxes 3000 --insurance 1200`,
		RunE: func(cmd *cobra.Command, args []string) error {
			jsonOutput, _ := cmd.Flags().GetBool("json")
			return runMortgage(principal, rate, years, taxes, insurance, pmi, jsonOutput)
		},
	}

	cmd.Flags().Float64VarP(&principal, "principal", "p", 0, "Loan principal")
	cmd.Flags().Float64VarP(&rate, "rate", "r", 0, "Annual interest rate (percentage)")
	cmd.Flags().Float64VarP(&years, "years", "y", 30, "Loan term in years")
	cmd.Flags().Float64Var(&taxes, "taxes", 0, "Annual property taxes")
	cmd.Flags().Float64Var(&insurance, "insurance", 0, "Annual insurance")
	cmd.Flags().Float64Var(&pmi, "pmi", 0, "Annual PMI")
	return cmd
}
