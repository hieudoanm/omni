package grayscale

import (
	"github.com/spf13/cobra"
)

var output string

func NewCmd() *cobra.Command {
	cmd := &cobra.Command{
		Use:   "grayscale <file>",
		Short: "Convert to grayscale",
		Args:  cobra.ExactArgs(1),
		RunE: func(cmd *cobra.Command, args []string) error {
			jsonOut, _ := cmd.Flags().GetBool("json")
			return runGrayscale(args[0], jsonOut)
		},
	}
	cmd.Flags().StringVarP(&output, "output", "o", "", "Output file path")
	return cmd
}
