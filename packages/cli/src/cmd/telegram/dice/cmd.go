package dice

import (
	"github.com/spf13/cobra"
)

func NewCmd() *cobra.Command {
	cmd := &cobra.Command{
		Use:   "dice",
		Short: "Send a dice",
		Long:  `Send a dice emoji that will display a random value.`,
		Example: `  telegram dice --chat-id @channel
  telegram dice --chat-id @channel --emoji 🏀`,
		RunE: runE,
	}

	cmd.Flags().String("chat-id", "", "Target chat ID or @username")
	cmd.Flags().String("emoji", "", "Dice emoji (🎲, 🎯, 🏀, ⚽, 🎳, 🎰)")
	cmd.Flags().Bool("disable-notification", false, "Send silently")
	cmd.Flags().Bool("protect-content", false, "Protect forwarded content")
	cmd.Flags().Int("reply-to-message-id", 0, "Reply to a message")

	return cmd
}
