package create_invite_link

import (
	"github.com/spf13/cobra"
)

func NewCmd() *cobra.Command {
	cmd := &cobra.Command{
		Use:     "create-invite-link",
		Short:   "Create an invite link",
		Long:    `Create an additional invite link for a chat.`,
		Example: `  telegram chat create-invite-link --chat-id @channel --name "Guests" --member-limit 10`,
		RunE:    runE,
	}

	cmd.Flags().String("chat-id", "", "Target chat ID or @username")
	cmd.Flags().String("name", "", "Invite link name")
	cmd.Flags().Int64("expire-date", 0, "Expiration Unix timestamp")
	cmd.Flags().Int("member-limit", 0, "Maximum number of users (1-99999)")
	cmd.Flags().Bool("creates-join-request", false, "Users must request admin approval")

	return cmd
}
