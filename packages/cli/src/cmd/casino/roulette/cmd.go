package roulette

import (
	"github.com/spf13/cobra"
)

func NewCmd() *cobra.Command {
	var spins int
	cmd := &cobra.Command{
		Use:   "roulette",
		Short: "Spin the roulette wheel",
		Long: `Spin a European roulette wheel (numbers 0-36) and display results.

Shows the number, color (Red/Black/Green), parity (Even/Odd), and half (1-18/19-36).`,
		Example: `  casino roulette
  casino roulette --spins 5`,
		RunE: func(cmd *cobra.Command, args []string) error {
			jsonOutput, _ := cmd.Flags().GetBool("json")
			return runRoulette(spins, jsonOutput)
		},
	}
	cmd.Flags().IntVarP(&spins, "spins", "n", 1, "Number of spins")
	return cmd
}
