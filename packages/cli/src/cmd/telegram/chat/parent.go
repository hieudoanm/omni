package chat

import (
	"github.com/hieudoanm/omni/packages/cli/src/cmd/telegram/chat/action"
	"github.com/hieudoanm/omni/packages/cli/src/cmd/telegram/chat/ban"
	"github.com/hieudoanm/omni/packages/cli/src/cmd/telegram/chat/create_invite_link"
	"github.com/hieudoanm/omni/packages/cli/src/cmd/telegram/chat/edit_invite_link"
	"github.com/hieudoanm/omni/packages/cli/src/cmd/telegram/chat/export_invite_link"
	"github.com/hieudoanm/omni/packages/cli/src/cmd/telegram/chat/get"
	"github.com/hieudoanm/omni/packages/cli/src/cmd/telegram/chat/leave"
	"github.com/hieudoanm/omni/packages/cli/src/cmd/telegram/chat/pin"
	"github.com/hieudoanm/omni/packages/cli/src/cmd/telegram/chat/promote"
	"github.com/hieudoanm/omni/packages/cli/src/cmd/telegram/chat/restrict"
	"github.com/hieudoanm/omni/packages/cli/src/cmd/telegram/chat/revoke_invite_link"
	"github.com/hieudoanm/omni/packages/cli/src/cmd/telegram/chat/unban"
	"github.com/spf13/cobra"
)

func NewCmd() *cobra.Command {
	cmd := &cobra.Command{
		Use:   "chat",
		Short: "Manage Telegram chats",
		Long:  `Manage Telegram chats: send actions, leave, or get chat info.`,
		Example: `  telegram chat action --chat-id @channel --action typing
  telegram chat leave --chat-id @channel
  telegram chat get --chat-id @channel
  telegram chat export-invite-link --chat-id @channel`,
		RunE: func(cmd *cobra.Command, args []string) error { return cmd.Help() },
	}
	cmd.AddCommand(action.NewCmd())
	cmd.AddCommand(ban.NewCmd())
	cmd.AddCommand(create_invite_link.NewCmd())
	cmd.AddCommand(edit_invite_link.NewCmd())
	cmd.AddCommand(export_invite_link.NewCmd())
	cmd.AddCommand(get.NewCmd())
	cmd.AddCommand(leave.NewCmd())
	cmd.AddCommand(pin.NewCmd())
	cmd.AddCommand(promote.NewCmd())
	cmd.AddCommand(restrict.NewCmd())
	cmd.AddCommand(revoke_invite_link.NewCmd())
	cmd.AddCommand(unban.NewCmd())
	return cmd
}
