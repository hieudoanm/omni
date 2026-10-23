package action

import (
	"github.com/spf13/cobra"
)

func NewCmd() *cobra.Command {
	cmd := &cobra.Command{
		Use:   "action",
		Short: "Send a chat action",
		Long:  `Broadcast a chat action (typing, upload_photo, etc.).`,
		Example: `  telegram chat action --chat-id @channel --action typing
  telegram chat action --chat-id @channel --action upload_photo`,
		RunE: runE,
	}

	cmd.Flags().String("chat-id", "", "Target chat ID or @username")
	cmd.Flags().String("action", "", "Action type (typing, upload_photo, record_video, upload_video, record_voice, upload_voice, upload_document, choose_sticker, find_location, record_video_note, upload_video_note)")

	return cmd
}
