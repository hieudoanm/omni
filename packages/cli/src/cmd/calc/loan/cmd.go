package loan

import (
	"github.com/spf13/cobra"
)

func NewCmd() *cobra.Command {
	var principal, rate, years float64

	cmd := &cobra.Command{
		Use:   "loan",
		Short: "Loan amortization calculator",
		Long: `Calculate loan amortization schedule with monthly payments.

Uses the standard amortization formula to compute monthly payments
and generates a detailed schedule showing payment, interest, and balance over time.`,
		Example: `  calc loan --principal 30000 --rate 5 --years 5
  calc loan -p 30000 -r 5 -y 5`,
		RunE: func(cmd *cobra.Command, args []string) error {
			jsonOutput, _ := cmd.Flags().GetBool("json")
			return runLoan(principal, rate, years, jsonOutput)
		},
	}

	cmd.Flags().Float64VarP(&principal, "principal", "p", 0, "Loan principal amount")
	cmd.Flags().Float64VarP(&rate, "rate", "r", 0, "Annual interest rate (percentage)")
	cmd.Flags().Float64VarP(&years, "years", "y", 0, "Loan term in years")
	cmd.Flags().Bool("json", false, "Output in JSON format")
	return cmd
}
