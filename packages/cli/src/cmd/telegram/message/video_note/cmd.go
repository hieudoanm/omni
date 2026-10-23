package video_note

import (
	"github.com/spf13/cobra"
)

func NewCmd() *cobra.Command {
	cmd := &cobra.Command{
		Use:     "video-note",
		Short:   "Send a video note",
		Long:    `Send a video note (rounded video message) to a Telegram chat.`,
		Example: `  telegram message video-note --chat-id @channel --video-note https://example.com/video.mp4`,
		RunE:    runE,
	}

	cmd.Flags().String("chat-id", "", "Target chat ID or @username")
	cmd.Flags().String("video-note", "", "Video note URL, file_id, or file path")
	cmd.Flags().Int("duration", 0, "Duration in seconds")
	cmd.Flags().Int("length", 0, "Video width and height in pixels")
	cmd.Flags().String("thumbnail", "", "Thumbnail URL or file_id")
	cmd.Flags().Bool("disable-notification", false, "Send silently")
	cmd.Flags().Bool("protect-content", false, "Protect forwarded content")
	cmd.Flags().Int("reply-to-message-id", 0, "Reply to a message")

	return cmd
}
