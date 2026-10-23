package combine

import (
	"github.com/hieudoanm/omni/packages/cli/src/cmd/pdf/combine/merge"
	"github.com/hieudoanm/omni/packages/cli/src/cmd/pdf/combine/split"
	"github.com/spf13/cobra"
)

func NewCommand() *cobra.Command {
	cmd := &cobra.Command{
		Use:   "combine",
		Short: "Merge and split PDF documents",
		RunE:  func(cmd *cobra.Command, args []string) error { return cmd.Help() },
	}
	cmd.AddCommand(merge.NewCommand())
	cmd.AddCommand(split.NewCommand())
	return cmd
}
