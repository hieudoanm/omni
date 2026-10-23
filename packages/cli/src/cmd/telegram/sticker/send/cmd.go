package send

import (
	"github.com/spf13/cobra"
)

func NewCmd() *cobra.Command {
	cmd := &cobra.Command{
		Use:     "send",
		Short:   "Send a sticker",
		Long:    `Send a sticker to a Telegram chat by file_id, URL, or file path.`,
		Example: `  telegram sticker send --chat-id @channel --sticker CAACAgIAAxkBAAIB`,
		RunE:    runE,
	}

	cmd.Flags().String("chat-id", "", "Target chat ID or @username")
	cmd.Flags().String("sticker", "", "Sticker file_id, URL, or file path")
	cmd.Flags().String("emoji", "", "Emoji associated with the sticker")
	cmd.Flags().Bool("disable-notification", false, "Send silently")
	cmd.Flags().Bool("protect-content", false, "Protect forwarded content")
	cmd.Flags().Int("reply-to-message-id", 0, "Reply to a message")

	return cmd
}
