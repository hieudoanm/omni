package round

import (
	"github.com/spf13/cobra"
)

var roundRadius int
var output string

func NewCmd() *cobra.Command {
	cmd := &cobra.Command{
		Use:   "round <file>",
		Short: "Round image corners or make circular",
		Args:  cobra.ExactArgs(1),
		RunE: func(cmd *cobra.Command, args []string) error {
			jsonOut, _ := cmd.Flags().GetBool("json")
			return runRound(args[0], jsonOut)
		},
	}
	cmd.Flags().IntVarP(&roundRadius, "radius", "r", 0, "Corner radius (0 for circle)")
	cmd.Flags().StringVarP(&output, "output", "o", "", "Output file path")
	return cmd
}
