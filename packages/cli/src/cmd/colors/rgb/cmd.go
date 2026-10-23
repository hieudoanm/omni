package rgb

import (
	"github.com/spf13/cobra"
)

func newCmd() *cobra.Command {
	return &cobra.Command{
		Use:     "rgb",
		Short:   "Convert RGB values to HEX, HSL, HCL, OKLCH, and CMYK",
		Long:    `Prompt for R, G, B values and convert them to HEX, HSL, HCL, OKLCH, and CMYK color spaces.`,
		Example: `  colors rgb`,
		RunE:    runRGB,
	}
}

func NewCmd() *cobra.Command {
	return newCmd()
}
