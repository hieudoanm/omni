package media_group

import (
	"github.com/spf13/cobra"
)

func NewCmd() *cobra.Command {
	cmd := &cobra.Command{
		Use:     "media-group",
		Short:   "Send a media group",
		Long:    `Send a group of photos, videos, or mixed media as an album. The --media flag accepts a JSON array of media items.`,
		Example: `  telegram message media-group --chat-id @channel --media '[{"type":"photo","media":"https://example.com/a.jpg"},{"type":"photo","media":"https://example.com/b.jpg"}]'`,
		RunE:    runE,
	}

	cmd.Flags().String("chat-id", "", "Target chat ID or @username")
	cmd.Flags().String("media", "", "JSON array of media items")
	cmd.Flags().Bool("disable-notification", false, "Send silently")
	cmd.Flags().Bool("protect-content", false, "Protect forwarded content")
	cmd.Flags().Int("reply-to-message-id", 0, "Reply to a message")

	return cmd
}
