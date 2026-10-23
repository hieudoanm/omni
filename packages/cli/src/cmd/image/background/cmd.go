package background

import (
	"github.com/spf13/cobra"
)

var bgColor string
var bgThreshold float64
var output string

func NewCmd() *cobra.Command {
	cmd := &cobra.Command{
		Use:   "background <file>",
		Short: "Replace background with solid color",
		Args:  cobra.ExactArgs(1),
		RunE: func(cmd *cobra.Command, args []string) error {
			jsonOut, _ := cmd.Flags().GetBool("json")
			return runBackground(args[0], jsonOut)
		},
	}
	cmd.Flags().StringVarP(&bgColor, "color", "c", "white", "Replacement color")
	cmd.Flags().Float64VarP(&bgThreshold, "threshold", "t", 0.5, "Color similarity threshold")
	cmd.Flags().StringVarP(&output, "output", "o", "", "Output file path")
	return cmd
}
