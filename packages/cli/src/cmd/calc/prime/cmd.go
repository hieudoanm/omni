package prime

import (
	"github.com/spf13/cobra"
)

func NewCmd() *cobra.Command {
	var number int
	var list bool

	cmd := &cobra.Command{
		Use:   "prime [--number <n>]",
		Short: "Check if a number is prime, or generate primes up to N",
		Long:  `Test primality of a number, or list/count primes up to a limit with --list.`,
		Example: `  calc prime --number 17
  calc prime --number 100 --list
  calc prime --number 1000000 --count`,
		RunE: func(cmd *cobra.Command, args []string) error {
			jsonOutput, _ := cmd.Flags().GetBool("json")
			return runPrime(number, list, jsonOutput)
		},
	}

	cmd.Flags().IntVarP(&number, "number", "n", 0, "Number to check or limit")
	cmd.Flags().BoolVarP(&list, "list", "l", false, "List all primes up to N")
	cmd.Flags().Bool("json", false, "Output in JSON format")
	return cmd
}
