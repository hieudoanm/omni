package list

import (
	"github.com/hieudoanm/omni/packages/cli/src/cmd/colors/figma/internal"
	"github.com/spf13/cobra"
)

func NewCommand() *cobra.Command {
	return &cobra.Command{
		Use:   "list",
		Short: "List all palette names from the Figma color directory",
		Long:  `Print all color palette names.`,
		Example: `  colors figma list
  colors figma list --json`,
		RunE: func(cmd *cobra.Command, args []string) error {
			return runList(internal.GetJSONFlag(cmd))
		},
	}
}
