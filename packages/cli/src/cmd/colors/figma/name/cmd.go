package name

import (
	"fmt"

	"github.com/hieudoanm/omni/packages/cli/src/cmd/colors/figma/internal"
	"github.com/spf13/cobra"
)

func NewCommand() *cobra.Command {
	cmd := &cobra.Command{
		Use:   "name",
		Short: "Look up a color palette and show its colors",
		Long:  `Search the Figma color palette directory by palette name (case-insensitive). Shows all colors in the palette.`,
		Example: `  colors figma name --name "Garnet Sunrise"
  colors figma name --name "royal gemstone dusk" --json`,
		RunE: func(cmd *cobra.Command, args []string) error {
			query := internal.FlagOrArg(cmd, args, "name")
			if query == "" {
				return fmt.Errorf("--name flag is required")
			}
			return runName(query, internal.GetJSONFlag(cmd))
		},
	}

	cmd.Flags().StringP("name", "n", "", "Palette name to look up")
	return cmd
}
