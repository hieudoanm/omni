package document

import (
	"github.com/spf13/cobra"
)

func NewCmd() *cobra.Command {
	cmd := &cobra.Command{
		Use:     "document",
		Short:   "Send a document",
		Long:    `Send a document or file to a Telegram chat.`,
		Example: `  telegram message document --chat-id @channel --document https://example.com/file.pdf --caption "Here is the file"`,
		RunE:    runE,
	}

	cmd.Flags().String("chat-id", "", "Target chat ID or @username")
	cmd.Flags().String("document", "", "Document URL, file_id, or file path")
	cmd.Flags().String("caption", "", "Caption for the document")
	cmd.Flags().String("parse-mode", "", "Parse mode: HTML, MarkdownV2, Markdown")
	cmd.Flags().String("thumbnail", "", "Thumbnail URL or file_id")
	cmd.Flags().Bool("disable-content-type-detection", false, "Disable file type detection")
	cmd.Flags().Bool("disable-notification", false, "Send silently")
	cmd.Flags().Bool("protect-content", false, "Protect forwarded content")
	cmd.Flags().Int("reply-to-message-id", 0, "Reply to a message")

	return cmd
}
