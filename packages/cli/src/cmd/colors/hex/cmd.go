package hex

import (
	"github.com/spf13/cobra"
)

func newCmd() *cobra.Command {
	return &cobra.Command{
		Use:     "hex",
		Short:   "Convert a HEX color to RGB, HSL, HCL, OKLCH, and CMYK",
		Long:    `Prompt for a HEX color code and convert it to RGB, HSL, HCL, OKLCH, and CMYK color spaces.`,
		Example: `  colors hex`,
		RunE:    runHex,
	}
}

func NewCmd() *cobra.Command {
	return newCmd()
}
