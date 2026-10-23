package revoke_invite_link

import (
	"github.com/spf13/cobra"
)

func NewCmd() *cobra.Command {
	cmd := &cobra.Command{
		Use:     "revoke-invite-link",
		Short:   "Revoke an invite link",
		Long:    `Revoke an invite link for a chat.`,
		Example: `  telegram chat revoke-invite-link --chat-id @channel --invite-link https://t.me/+abc`,
		RunE:    runE,
	}

	cmd.Flags().String("chat-id", "", "Target chat ID or @username")
	cmd.Flags().String("invite-link", "", "The invite link to revoke")

	return cmd
}
