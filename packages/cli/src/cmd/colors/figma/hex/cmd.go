package hex

import (
	"fmt"

	"github.com/hieudoanm/omni/packages/cli/src/cmd/colors/figma/internal"
	"github.com/spf13/cobra"
)

func NewCommand() *cobra.Command {
	cmd := &cobra.Command{
		Use:   "hex",
		Short: "Find the closest named color to a given hex code",
		Long:  `Given a hex color code, find the closest named color from the Figma palette data using Euclidean distance in RGB space.`,
		Example: `  colors figma hex --hex "#D3045D"
  colors figma hex --hex D3045D
  colors figma hex --hex "#007BA7" --json`,
		RunE: func(cmd *cobra.Command, args []string) error {
			hex := internal.FlagOrArg(cmd, args, "hex")
			if hex == "" {
				return fmt.Errorf("--hex flag is required")
			}
			return runHex(hex, internal.GetJSONFlag(cmd))
		},
	}

	cmd.Flags().StringP("hex", "x", "", "Hex color code to look up (with or without #)")
	return cmd
}
