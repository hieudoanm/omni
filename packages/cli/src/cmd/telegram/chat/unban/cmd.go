package unban

import (
	"github.com/spf13/cobra"
)

func NewCmd() *cobra.Command {
	cmd := &cobra.Command{
		Use:     "unban",
		Short:   "Unban a user from a chat",
		Long:    `Remove a user from the ban list of a group, supergroup, or channel.`,
		Example: `  telegram chat unban --chat-id @channel --user-id 123456789`,
		RunE:    runE,
	}

	cmd.Flags().String("chat-id", "", "Target chat ID or @username")
	cmd.Flags().Int64("user-id", 0, "User ID to unban")
	cmd.Flags().Bool("only-if-banned", false, "Only unban if already banned")

	return cmd
}
