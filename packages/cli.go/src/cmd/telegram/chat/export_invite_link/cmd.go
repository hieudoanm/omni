package export_invite_link

import (
	"github.com/spf13/cobra"
)

func NewCmd() *cobra.Command {
	cmd := &cobra.Command{
		Use:     "export-invite-link",
		Short:   "Export primary invite link",
		Long:    `Get the primary invite link for a chat.`,
		Example: `  telegram chat export-invite-link --chat-id @channel`,
		RunE:    runE,
	}

	cmd.Flags().String("chat-id", "", "Target chat ID or @username")

	return cmd
}
