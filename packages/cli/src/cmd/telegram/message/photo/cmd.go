package photo

import (
	"github.com/spf13/cobra"
)

func NewCmd() *cobra.Command {
	cmd := &cobra.Command{
		Use:     "photo",
		Short:   "Send a photo",
		Long:    `Send a photo to a Telegram chat.`,
		Example: `  telegram message photo --chat-id @channel --photo https://example.com/image.jpg --caption "Look at this"`,
		RunE:    runE,
	}

	cmd.Flags().String("chat-id", "", "Target chat ID or @username")
	cmd.Flags().String("photo", "", "Photo URL, file_id, or file path")
	cmd.Flags().String("caption", "", "Caption for the photo")
	cmd.Flags().String("parse-mode", "", "Parse mode: HTML, MarkdownV2, Markdown")
	cmd.Flags().Bool("has-spoiler", false, "Cover with spoiler animation")
	cmd.Flags().Bool("disable-notification", false, "Send silently")
	cmd.Flags().Bool("protect-content", false, "Protect forwarded content")
	cmd.Flags().Int("reply-to-message-id", 0, "Reply to a message")

	return cmd
}
