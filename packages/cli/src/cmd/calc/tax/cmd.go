package tax

import (
	"github.com/spf13/cobra"
)

func NewCmd() *cobra.Command {
	var (
		mode       string
		period     string
		income     float64
		dependents int
		insurance  bool
		jsonOut    bool
		csvOut     bool
	)

	cmd := &cobra.Command{
		Use:   "tax",
		Short: "Calculate Vietnam personal income tax",
		Long:  `Calculate Vietnam personal income tax (PIT). Supports gross-to-net and net-to-gross modes, dependent deductions, and insurance.`,
		Example: `  calc tax --income 15000000
  calc tax --mode net --income 12000000 --dependents 2 --insurance
  calc tax --income 200000000 --period annual --json`,
		RunE: func(cmd *cobra.Command, args []string) error {
			return runTax(mode, period, income, dependents, insurance, jsonOut, csvOut)
		},
	}

	cmd.Flags().StringVarP(&mode, "mode", "m", "gross", "Salary mode (gross or net)")
	cmd.Flags().StringVarP(&period, "period", "p", "monthly", "Period (monthly or annual)")
	cmd.Flags().Float64Var(&income, "income", 0, "Income amount in VND")
	cmd.Flags().IntVarP(&dependents, "dependents", "d", 0, "Number of dependents")
	cmd.Flags().BoolVar(&insurance, "insurance", true, "Include insurance deductions")
	cmd.Flags().BoolVar(&jsonOut, "json", false, "Output in JSON format")
	cmd.Flags().BoolVar(&csvOut, "csv", false, "Export to CSV file")
	return cmd
}
