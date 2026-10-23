package random

import (
	"github.com/spf13/cobra"
)

func newCmd() *cobra.Command {
	var maxHEX int
	cmd := &cobra.Command{
		Use:   "random",
		Short: "Generate random HEX colors with RGB preview",
		Long:  `Generate one or more random HEX colors and display them alongside their RGB values.`,
		Example: `  colors random
  colors random --max 5`,
		RunE: runRandom,
	}
	cmd.Flags().IntVarP(&maxHEX, "max", "m", 1, "number of random colors")
	return cmd
}

func NewCmd() *cobra.Command {
	return newCmd()
}
