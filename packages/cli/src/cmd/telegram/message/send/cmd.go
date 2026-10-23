package send

import (
	"github.com/spf13/cobra"
)

func NewCmd() *cobra.Command {
	cmd := &cobra.Command{
		Use:   "send",
		Short: "Send a Telegram message",
		Long:  `Send a text message to a Telegram chat.`,
		Example: `  telegram message send --chat-id 123456 --text "Hello"
  telegram message send --chat-id @username --text "Hello" --parse-mode HTML`,
		RunE: runE,
	}

	cmd.Flags().String("chat-id", "", "Target chat ID or @username")
	cmd.Flags().String("text", "", "Message text")
	cmd.Flags().String("parse-mode", "", "Parse mode: HTML, MarkdownV2, Markdown")
	cmd.Flags().Bool("disable-web-page-preview", false, "Disable link preview")
	cmd.Flags().Bool("disable-notification", false, "Send silently")
	cmd.Flags().Bool("protect-content", false, "Protect forwarded content")
	cmd.Flags().Int("reply-to-message-id", 0, "Reply to a message")

	return cmd
}
