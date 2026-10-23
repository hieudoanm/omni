package leave

import (
	"github.com/spf13/cobra"
)

func NewCmd() *cobra.Command {
	cmd := &cobra.Command{
		Use:     "leave",
		Short:   "Leave a chat",
		Long:    `Leave a group, supergroup, or channel.`,
		Example: `  telegram chat leave --chat-id @channel`,
		RunE:    runE,
	}

	cmd.Flags().String("chat-id", "", "Target chat ID or @username")

	return cmd
}
