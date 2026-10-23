package reopen

import (
	"github.com/spf13/cobra"
)

func NewCmd() *cobra.Command {
	cmd := &cobra.Command{
		Use:     "reopen",
		Short:   "Reopen a forum topic",
		Long:    `Reopen a closed topic in a forum supergroup.`,
		Example: `  telegram forum reopen --chat-id @channel --message-thread-id 42`,
		RunE:    runE,
	}

	cmd.Flags().String("chat-id", "", "Target supergroup chat ID or @username")
	cmd.Flags().Int("message-thread-id", 0, "Topic message thread ID")

	return cmd
}
