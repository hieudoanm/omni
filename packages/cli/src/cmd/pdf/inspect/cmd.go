package inspect

import (
	"github.com/hieudoanm/omni/packages/cli/src/cmd/pdf/inspect/info"
	"github.com/hieudoanm/omni/packages/cli/src/cmd/pdf/inspect/metadata"
	"github.com/spf13/cobra"
)

func NewCommand() *cobra.Command {
	cmd := &cobra.Command{
		Use:   "inspect",
		Short: "Read PDF properties: info and metadata",
		RunE:  func(cmd *cobra.Command, args []string) error { return cmd.Help() },
	}
	cmd.AddCommand(info.NewCommand())
	cmd.AddCommand(metadata.NewCommand())
	return cmd
}
