package forum

import (
	"github.com/hieudoanm/omni/packages/cli/src/cmd/telegram/forum/close"
	"github.com/hieudoanm/omni/packages/cli/src/cmd/telegram/forum/create"
	"github.com/hieudoanm/omni/packages/cli/src/cmd/telegram/forum/delete"
	"github.com/hieudoanm/omni/packages/cli/src/cmd/telegram/forum/reopen"
	"github.com/spf13/cobra"
)

func NewCmd() *cobra.Command {
	cmd := &cobra.Command{
		Use:   "forum",
		Short: "Manage forum topics",
		RunE:  func(cmd *cobra.Command, args []string) error { return cmd.Help() },
	}
	cmd.AddCommand(close.NewCmd())
	cmd.AddCommand(create.NewCmd())
	cmd.AddCommand(delete.NewCmd())
	cmd.AddCommand(reopen.NewCmd())
	return cmd
}
