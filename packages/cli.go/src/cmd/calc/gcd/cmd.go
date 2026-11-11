package gcd

import (
	"github.com/spf13/cobra"
)

func NewCmd() *cobra.Command {
	var a, b int
	cmd := &cobra.Command{
		Use:   "gcd [--a <a> --b <b>]",
		Short: "Greatest common divisor of two numbers",
		Long:  `Compute the greatest common divisor (GCD) of two integers using the Euclidean algorithm.`,
		Example: `  calc gcd --a 12 --b 18
  calc gcd --a 100 --b 75`,
		RunE: func(cmd *cobra.Command, args []string) error {
			jsonOutput, _ := cmd.Flags().GetBool("json")
			return runGcd(a, b, jsonOutput)
		},
	}

	cmd.Flags().IntVarP(&a, "a", "a", 0, "First number")
	cmd.Flags().IntVarP(&b, "b", "b", 0, "Second number")
	cmd.Flags().Bool("json", false, "Output in JSON format")
	return cmd
}
