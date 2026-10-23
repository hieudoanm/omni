package copy

import (
	"github.com/spf13/cobra"
)

func NewCmd() *cobra.Command {
	cmd := &cobra.Command{
		Use:     "copy",
		Short:   "Copy a message",
		Long:    `Copy a message from one chat to another.`,
		Example: `  telegram message copy --chat-id 123456 --from-chat-id 789012 --message-id 42`,
		RunE:    runE,
	}

	cmd.Flags().String("chat-id", "", "Target chat ID or @username")
	cmd.Flags().String("from-chat-id", "", "Source chat ID or @username")
	cmd.Flags().Int("message-id", 0, "Message ID to copy")
	cmd.Flags().String("caption", "", "New caption for media")
	cmd.Flags().String("parse-mode", "", "Parse mode: HTML, MarkdownV2, Markdown")

	return cmd
}
