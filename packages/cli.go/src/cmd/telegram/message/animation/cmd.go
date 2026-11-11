package animation

import (
	"github.com/spf13/cobra"
)

func NewCmd() *cobra.Command {
	cmd := &cobra.Command{
		Use:     "animation",
		Short:   "Send an animation (GIF)",
		Long:    `Send an animation or GIF to a Telegram chat.`,
		Example: `  telegram message animation --chat-id @channel --animation https://example.com/animation.gif --caption "Funny GIF"`,
		RunE:    runE,
	}

	cmd.Flags().String("chat-id", "", "Target chat ID or @username")
	cmd.Flags().String("animation", "", "Animation URL, file_id, or file path")
	cmd.Flags().String("caption", "", "Caption for the animation")
	cmd.Flags().String("parse-mode", "", "Parse mode: HTML, MarkdownV2, Markdown")
	cmd.Flags().Int("duration", 0, "Duration in seconds")
	cmd.Flags().Int("width", 0, "Animation width")
	cmd.Flags().Int("height", 0, "Animation height")
	cmd.Flags().String("thumbnail", "", "Thumbnail URL or file_id")
	cmd.Flags().Bool("has-spoiler", false, "Cover with spoiler animation")
	cmd.Flags().Bool("disable-notification", false, "Send silently")
	cmd.Flags().Bool("protect-content", false, "Protect forwarded content")
	cmd.Flags().Int("reply-to-message-id", 0, "Reply to a message")

	return cmd
}
