package sharpen

import (
	"github.com/spf13/cobra"
)

var amount float64
var output string

func NewCmd() *cobra.Command {
	cmd := &cobra.Command{
		Use:   "sharpen <file>",
		Short: "Sharpen image",
		Args:  cobra.ExactArgs(1),
		RunE: func(cmd *cobra.Command, args []string) error {
			jsonOut, _ := cmd.Flags().GetBool("json")
			return runSharpen(args[0], jsonOut)
		},
	}
	cmd.Flags().Float64VarP(&amount, "amount", "a", 1.0, "Sharpen amount")
	cmd.Flags().StringVarP(&output, "output", "o", "", "Output file path")
	return cmd
}
