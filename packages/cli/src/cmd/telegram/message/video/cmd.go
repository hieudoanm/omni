package video

import (
	"github.com/spf13/cobra"
)

func NewCmd() *cobra.Command {
	cmd := &cobra.Command{
		Use:     "video",
		Short:   "Send a video",
		Long:    `Send a video to a Telegram chat.`,
		Example: `  telegram message video --chat-id @channel --video https://example.com/video.mp4 --caption "Check this out"`,
		RunE:    runE,
	}

	cmd.Flags().String("chat-id", "", "Target chat ID or @username")
	cmd.Flags().String("video", "", "Video URL, file_id, or file path")
	cmd.Flags().String("caption", "", "Caption for the video")
	cmd.Flags().String("parse-mode", "", "Parse mode: HTML, MarkdownV2, Markdown")
	cmd.Flags().Int("duration", 0, "Duration in seconds")
	cmd.Flags().Int("width", 0, "Video width")
	cmd.Flags().Int("height", 0, "Video height")
	cmd.Flags().String("thumbnail", "", "Thumbnail URL or file_id")
	cmd.Flags().Bool("supports-streaming", false, "Video supports streaming")
	cmd.Flags().Bool("has-spoiler", false, "Cover with spoiler animation")
	cmd.Flags().Bool("disable-notification", false, "Send silently")
	cmd.Flags().Bool("protect-content", false, "Protect forwarded content")
	cmd.Flags().Int("reply-to-message-id", 0, "Reply to a message")

	return cmd
}
