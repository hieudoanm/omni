package combine

import (
	"github.com/spf13/cobra"
)

var direction string
var output string

func NewCmd() *cobra.Command {
	cmd := &cobra.Command{
		Use:   "combine <file1> <file2>",
		Short: "Combine two images side by side",
		Args:  cobra.ExactArgs(2),
		RunE: func(cmd *cobra.Command, args []string) error {
			jsonOut, _ := cmd.Flags().GetBool("json")
			return runCombine(args[0], args[1], jsonOut)
		},
	}
	cmd.Flags().StringVarP(&direction, "direction", "d", "horizontal", "Combine direction (horizontal, vertical)")
	cmd.Flags().StringVarP(&output, "output", "o", "", "Output file path")
	return cmd
}
