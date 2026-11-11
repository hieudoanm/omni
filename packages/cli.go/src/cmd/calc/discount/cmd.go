package discount

import (
	"github.com/spf13/cobra"
)

func NewCmd() *cobra.Command {
	var original, percent float64

	cmd := &cobra.Command{
		Use:   "discount",
		Short: "Calculate discount and sale price",
		Long: `Calculate the sale price after applying a percentage discount.

Given the original price and discount percentage, shows the amount saved and final price.`,
		Example: `  calc discount --original 100 --percent 20
  calc discount -o 100 -p 20`,
		RunE: func(cmd *cobra.Command, args []string) error {
			jsonOutput, _ := cmd.Flags().GetBool("json")
			return runDiscount(original, percent, jsonOutput)
		},
	}

	cmd.Flags().Float64VarP(&original, "original", "o", 0, "Original price")
	cmd.Flags().Float64VarP(&percent, "percent", "p", 0, "Discount percentage")
	cmd.Flags().Bool("json", false, "Output in JSON format")
	return cmd
}
