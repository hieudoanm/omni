package tip

import (
	"github.com/spf13/cobra"
)

func NewCmd() *cobra.Command {
	var bill, tipPercent float64
	var split int

	cmd := &cobra.Command{
		Use:   "tip",
		Short: "Calculate tip and split bill",
		Long: `Calculate the tip amount, total bill, and per-person share when splitting.

Enter the bill amount, tip percentage, and number of people to split.`,
		Example: `  calc tip --bill 50 --percent 15 --split 4
  calc tip -b 50 -p 15 -s 4`,
		RunE: func(cmd *cobra.Command, args []string) error {
			jsonOutput, _ := cmd.Flags().GetBool("json")
			return runTip(bill, tipPercent, split, jsonOutput)
		},
	}

	cmd.Flags().Float64VarP(&bill, "bill", "b", 0, "Bill amount")
	cmd.Flags().Float64VarP(&tipPercent, "percent", "p", 15, "Tip percentage")
	cmd.Flags().IntVarP(&split, "split", "s", 1, "Number of people splitting")
	cmd.Flags().Bool("json", false, "Output in JSON format")
	return cmd
}
