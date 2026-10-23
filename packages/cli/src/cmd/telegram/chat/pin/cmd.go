package pin

import (
	"github.com/spf13/cobra"
)

func NewCmd() *cobra.Command {
	cmd := &cobra.Command{
		Use:   "pin",
		Short: "Pin a message in a chat",
		Long:  `Pin a message in a group, supergroup, or channel.`,
		Example: `  telegram chat pin --chat-id @channel --message-id 42
  telegram chat pin --chat-id @channel --message-id 42 --disable-notification`,
		RunE: runE,
	}

	cmd.Flags().String("chat-id", "", "Target chat ID or @username")
	cmd.Flags().Int("message-id", 0, "Message ID to pin")
	cmd.Flags().Bool("disable-notification", false, "Don't notify chat members")

	return cmd
}
