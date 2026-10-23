package figma

import (
	"github.com/hieudoanm/omni/packages/cli/src/cmd/colors/figma/hex"
	"github.com/hieudoanm/omni/packages/cli/src/cmd/colors/figma/list"
	"github.com/hieudoanm/omni/packages/cli/src/cmd/colors/figma/name"
	"github.com/hieudoanm/omni/packages/cli/src/cmd/colors/figma/palettes"
	"github.com/spf13/cobra"
)

func NewCommand() *cobra.Command {
	cmd := &cobra.Command{
		Use:   "figma",
		Short: "Figma color palettes: list, look up, and explore color palettes",
		Long:  `Explore Figma color palettes. List all palettes, look up a palette by name, find a palette by hex code, or view palette details.`,
		Example: `  colors figma list
  colors figma list --json
  colors figma name --name "Garnet Sunrise"
  colors figma hex --hex "#D3045D"
  colors figma palettes`,
		RunE: func(cmd *cobra.Command, args []string) error { return cmd.Help() },
	}

	cmd.PersistentFlags().BoolP("json", "j", false, "Output in JSON format")

	cmd.AddCommand(list.NewCommand())
	cmd.AddCommand(name.NewCommand())
	cmd.AddCommand(hex.NewCommand())
	cmd.AddCommand(palettes.NewCommand())

	return cmd
}
