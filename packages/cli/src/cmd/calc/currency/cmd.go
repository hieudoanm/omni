package currency

import (
	"github.com/spf13/cobra"
)

func NewCmd() *cobra.Command {
	var from, to string
	var amount float64

	cmd := &cobra.Command{
		Use:     "currency",
		Aliases: []string{"cc", "fx"},
		Short:   "Convert between currencies using Frankfurter API",
		Long:    `Convert amounts between world currencies using the European Central Bank's Frankfurter exchange rate API.`,
		Example: `  calc currency --from USD --to EUR --amount 100`,
		RunE: func(cmd *cobra.Command, args []string) error {
			jsonOutput, _ := cmd.Flags().GetBool("json")
			return runCurrency(from, to, amount, jsonOutput)
		},
	}

	cmd.Flags().StringVar(&from, "from", "EUR", "Source currency (default EUR)")
	cmd.Flags().StringVar(&to, "to", "USD", "Target currency (default USD)")
	cmd.Flags().Float64Var(&amount, "amount", 1, "Amount to convert (default 1)")
	cmd.Flags().Bool("json", false, "Output in JSON format")
	return cmd
}
