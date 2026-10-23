package voice

import (
	"github.com/spf13/cobra"
)

func NewCmd() *cobra.Command {
	cmd := &cobra.Command{
		Use:     "voice",
		Short:   "Send a voice message",
		Long:    `Send a voice message to a Telegram chat.`,
		Example: `  telegram message voice --chat-id @channel --voice https://example.com/voice.ogg`,
		RunE:    runE,
	}

	cmd.Flags().String("chat-id", "", "Target chat ID or @username")
	cmd.Flags().String("voice", "", "Voice URL, file_id, or file path")
	cmd.Flags().String("caption", "", "Caption for the voice message")
	cmd.Flags().String("parse-mode", "", "Parse mode: HTML, MarkdownV2, Markdown")
	cmd.Flags().Int("duration", 0, "Duration in seconds")
	cmd.Flags().Bool("disable-notification", false, "Send silently")
	cmd.Flags().Bool("protect-content", false, "Protect forwarded content")
	cmd.Flags().Int("reply-to-message-id", 0, "Reply to a message")

	return cmd
}
