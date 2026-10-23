package edit_invite_link

import (
	"github.com/spf13/cobra"
)

func NewCmd() *cobra.Command {
	cmd := &cobra.Command{
		Use:     "edit-invite-link",
		Short:   "Edit an invite link",
		Long:    `Edit a non-primary invite link for a chat.`,
		Example: `  telegram chat edit-invite-link --chat-id @channel --invite-link https://t.me/+abc --name "Updated"`,
		RunE:    runE,
	}

	cmd.Flags().String("chat-id", "", "Target chat ID or @username")
	cmd.Flags().String("invite-link", "", "The invite link to edit")
	cmd.Flags().String("name", "", "Invite link name")
	cmd.Flags().Int64("expire-date", 0, "Expiration Unix timestamp")
	cmd.Flags().Int("member-limit", 0, "Maximum number of users (1-99999)")
	cmd.Flags().Bool("creates-join-request", false, "Users must request admin approval")

	return cmd
}
