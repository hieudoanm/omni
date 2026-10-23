package palettes

import (
	"github.com/hieudoanm/omni/packages/cli/src/cmd/colors/figma/internal"
	"github.com/spf13/cobra"
)

func NewCommand() *cobra.Command {
	return &cobra.Command{
		Use:   "palettes",
		Short: "Display all color palettes with their colors",
		Long:  `Show every palette from the Figma color directory with all of its colors and hex codes.`,
		Example: `  colors figma palettes
  colors figma palettes --json`,
		RunE: func(cmd *cobra.Command, args []string) error {
			return runPalettes(internal.GetJSONFlag(cmd))
		},
	}
}
