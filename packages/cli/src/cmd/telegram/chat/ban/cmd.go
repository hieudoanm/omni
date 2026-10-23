package ban

import (
	"github.com/spf13/cobra"
)

func NewCmd() *cobra.Command {
	cmd := &cobra.Command{
		Use:   "ban",
		Short: "Ban a user from a chat",
		Long:  `Ban a user from a group, supergroup, or channel.`,
		Example: `  telegram chat ban --chat-id @channel --user-id 123456789
  telegram chat ban --chat-id @channel --user-id 123456789 --until-date 1767225600`,
		RunE: runE,
	}

	cmd.Flags().String("chat-id", "", "Target chat ID or @username")
	cmd.Flags().Int64("user-id", 0, "User ID to ban")
	cmd.Flags().Int64("until-date", 0, "Date when ban expires (Unix time)")
	cmd.Flags().Bool("revoke-messages", false, "Delete all user's messages")

	return cmd
}
