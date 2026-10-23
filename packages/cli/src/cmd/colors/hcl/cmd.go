package hcl

import (
	"github.com/spf13/cobra"
)

func newCmd() *cobra.Command {
	return &cobra.Command{
		Use:     "hcl",
		Short:   "Convert HCL values to HEX, RGB, HSL, OKLCH, and CMYK",
		Long:    `Prompt for HCL (Hue, Chroma, Lightness) values and convert them to RGB, HEX, HSL, OKLCH, and CMYK color spaces.`,
		Example: `  colors hcl`,
		RunE:    runHCL,
	}
}

func NewCmd() *cobra.Command {
	return newCmd()
}
