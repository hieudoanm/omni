package lcm

import (
	"github.com/spf13/cobra"
)

func NewCmd() *cobra.Command {
	var a, b int
	cmd := &cobra.Command{
		Use:   "lcm [--a <a> --b <b>]",
		Short: "Least common multiple of two numbers",
		Long: `Compute the least common multiple (LCM) of two integers using the GCD method.

LCM(a, b) = |a * b| / GCD(a, b)`,
		Example: `  calc lcm --a 12 --b 18
  calc lcm --a 7 --b 5`,
		RunE: func(cmd *cobra.Command, args []string) error {
			jsonOutput, _ := cmd.Flags().GetBool("json")
			return runLcm(a, b, jsonOutput)
		},
	}

	cmd.Flags().IntVarP(&a, "a", "a", 0, "First number")
	cmd.Flags().IntVarP(&b, "b", "b", 0, "Second number")
	cmd.Flags().Bool("json", false, "Output in JSON format")
	return cmd
}
