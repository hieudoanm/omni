package oklch

import (
	"github.com/spf13/cobra"
)

func newCmd() *cobra.Command {
	return &cobra.Command{
		Use:     "oklch",
		Short:   "Convert OKLCH values to HEX, RGB, HSL, HCL, and CMYK",
		Long:    `Prompt for OKLCH (Lightness, Chroma, Hue) values and convert them to RGB, HEX, HSL, HCL, and CMYK color spaces.`,
		Example: `  colors oklch`,
		RunE:    runOKLCH,
	}
}

func NewCmd() *cobra.Command {
	return newCmd()
}
