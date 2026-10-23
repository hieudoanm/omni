package delete

import (
	"github.com/spf13/cobra"
)

func NewCmd() *cobra.Command {
	cmd := &cobra.Command{
		Use:     "delete",
		Short:   "Delete a forum topic",
		Long:    `Delete a topic in a forum supergroup.`,
		Example: `  telegram forum delete --chat-id @channel --message-thread-id 42`,
		RunE:    runE,
	}

	cmd.Flags().String("chat-id", "", "Target supergroup chat ID or @username")
	cmd.Flags().Int("message-thread-id", 0, "Topic message thread ID")

	return cmd
}
