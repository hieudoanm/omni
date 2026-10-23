package factorial

import (
	"github.com/spf13/cobra"
)

func NewCmd() *cobra.Command {
	var number int
	cmd := &cobra.Command{
		Use:   "factorial [--number <n>]",
		Short: "Compute factorial of a number (n!)",
		Long:  `Calculate the factorial of a non-negative integer using arbitrary-precision arithmetic.`,
		Example: `  calc factorial --number 10
  calc factorial --number 100`,
		RunE: func(cmd *cobra.Command, args []string) error {
			jsonOutput, _ := cmd.Flags().GetBool("json")
			return runFactorial(number, jsonOutput)
		},
	}

	cmd.Flags().IntVarP(&number, "number", "n", 0, "Non-negative integer")
	cmd.Flags().Bool("json", false, "Output in JSON format")
	return cmd
}
