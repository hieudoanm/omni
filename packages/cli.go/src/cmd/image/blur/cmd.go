package blur

import (
	"github.com/spf13/cobra"
)

var radius float64
var output string

func NewCmd() *cobra.Command {
	cmd := &cobra.Command{
		Use:   "blur <file>",
		Short: "Apply gaussian blur",
		Args:  cobra.ExactArgs(1),
		RunE: func(cmd *cobra.Command, args []string) error {
			jsonOut, _ := cmd.Flags().GetBool("json")
			return runBlur(args[0], jsonOut)
		},
	}
	cmd.Flags().Float64VarP(&radius, "radius", "r", 3.0, "Blur radius")
	cmd.Flags().StringVarP(&output, "output", "o", "", "Output file path")
	return cmd
}
