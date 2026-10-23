package forward

import (
	"github.com/spf13/cobra"
)

func NewCmd() *cobra.Command {
	cmd := &cobra.Command{
		Use:     "forward",
		Short:   "Forward a message",
		Long:    `Forward a message from one chat to another.`,
		Example: `  telegram message forward --chat-id 123456 --from-chat-id 789012 --message-id 42`,
		RunE:    runE,
	}

	cmd.Flags().String("chat-id", "", "Target chat ID or @username")
	cmd.Flags().String("from-chat-id", "", "Source chat ID or @username")
	cmd.Flags().Int("message-id", 0, "Message ID to forward")

	return cmd
}
