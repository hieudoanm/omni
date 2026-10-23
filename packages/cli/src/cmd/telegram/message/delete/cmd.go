package delete

import (
	"github.com/spf13/cobra"
)

func NewCmd() *cobra.Command {
	cmd := &cobra.Command{
		Use:     "delete",
		Short:   "Delete a message",
		Long:    `Delete a message sent by the bot.`,
		Example: `  telegram message delete --chat-id 123456 --message-id 42`,
		RunE:    runE,
	}

	cmd.Flags().String("chat-id", "", "Target chat ID or @username")
	cmd.Flags().Int("message-id", 0, "Message ID to delete")

	return cmd
}
