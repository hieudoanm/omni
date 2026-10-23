package colors

import (
	"github.com/hieudoanm/omni/packages/cli/src/cmd/colors/figma"
	"github.com/hieudoanm/omni/packages/cli/src/cmd/colors/hcl"
	"github.com/hieudoanm/omni/packages/cli/src/cmd/colors/hex"
	"github.com/hieudoanm/omni/packages/cli/src/cmd/colors/oklch"
	"github.com/hieudoanm/omni/packages/cli/src/cmd/colors/palette"
	"github.com/hieudoanm/omni/packages/cli/src/cmd/colors/random"
	"github.com/hieudoanm/omni/packages/cli/src/cmd/colors/rgb"
	"github.com/spf13/cobra"
)

func NewCommand() *cobra.Command {
	cmd := &cobra.Command{
		Use:   "colors",
		Short: "Color conversion and palette generation tools",
		Long:  `Convert between color spaces (HEX, RGB, HSL, HCL, OKLCH, CMYK) and generate color palettes.`,
		Example: `  colors hex
  colors rgb
  colors hcl
  colors oklch
  colors palette
  colors random
  colors figma list
  colors figma list
  colors figma name --name "Garnet Sunrise"
  colors figma hex --hex "#D3045D"
  colors figma palettes`,
		RunE: func(cmd *cobra.Command, args []string) error { return cmd.Help() },
	}

	cmd.PersistentFlags().BoolP("json", "j", false, "Output in JSON format")
	cmd.AddCommand(hex.NewCmd())
	cmd.AddCommand(rgb.NewCmd())
	cmd.AddCommand(hcl.NewCmd())
	cmd.AddCommand(oklch.NewCmd())
	cmd.AddCommand(palette.NewCmd())
	cmd.AddCommand(random.NewCmd())
	cmd.AddCommand(figma.NewCommand())

	return cmd
}
