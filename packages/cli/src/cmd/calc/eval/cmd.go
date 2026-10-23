package eval

import (
	"github.com/spf13/cobra"
)

func NewCmd() *cobra.Command {
	var expression string
	cmd := &cobra.Command{
		Use:   "eval [--expression <expression>]",
		Short: "Evaluate a mathematical expression",
		Long: `Evaluate arbitrary math expressions with operators and functions.

Operators: +, -, *, /, ^ (power)
Functions: sqrt, sin, cos, tan, abs, floor, ceil, round, log, log10, exp
Constants: pi, e

Use parentheses for grouping.`,
		Example: `  calc eval --expression "2 + 2"
  calc eval --expression "sqrt(144) * 2"
  calc eval --expression "pi * 5 ^ 2"
  calc eval --expression "sin(45) ^ 2 + cos(45) ^ 2"`,
		RunE: func(cmd *cobra.Command, args []string) error {
			jsonOutput, _ := cmd.Flags().GetBool("json")
			return runEval(expression, jsonOutput)
		},
	}

	cmd.Flags().StringVarP(&expression, "expression", "e", "", "Mathematical expression to evaluate")
	cmd.Flags().Bool("json", false, "Output in JSON format")
	return cmd
}
