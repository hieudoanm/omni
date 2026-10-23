package audio

import (
	"github.com/spf13/cobra"
)

func NewCmd() *cobra.Command {
	cmd := &cobra.Command{
		Use:     "audio",
		Short:   "Send an audio file",
		Long:    `Send an audio file to a Telegram chat.`,
		Example: `  telegram message audio --chat-id @channel --audio https://example.com/song.mp3 --caption "Listen to this"`,
		RunE:    runE,
	}

	cmd.Flags().String("chat-id", "", "Target chat ID or @username")
	cmd.Flags().String("audio", "", "Audio URL, file_id, or file path")
	cmd.Flags().String("caption", "", "Caption for the audio")
	cmd.Flags().String("parse-mode", "", "Parse mode: HTML, MarkdownV2, Markdown")
	cmd.Flags().Int("duration", 0, "Duration in seconds")
	cmd.Flags().String("performer", "", "Performer name")
	cmd.Flags().String("title", "", "Track title")
	cmd.Flags().String("thumbnail", "", "Thumbnail URL or file_id")
	cmd.Flags().Bool("disable-notification", false, "Send silently")
	cmd.Flags().Bool("protect-content", false, "Protect forwarded content")
	cmd.Flags().Int("reply-to-message-id", 0, "Reply to a message")

	return cmd
}
