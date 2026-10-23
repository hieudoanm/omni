package gift

import (
	"github.com/hieudoanm/omni/packages/cli/src/cmd/telegram/gift/send"
	"github.com/spf13/cobra"
)

func NewCmd() *cobra.Command {
	cmd := &cobra.Command{
		Use:   "gift",
		Short: "Send gifts",
		RunE:  func(cmd *cobra.Command, args []string) error { return cmd.Help() },
	}
	cmd.AddCommand(send.NewCmd())
	return cmd
}
