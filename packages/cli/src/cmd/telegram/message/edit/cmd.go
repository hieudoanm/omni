package edit

import (
	"github.com/spf13/cobra"
)

func NewCmd() *cobra.Command {
	cmd := &cobra.Command{
		Use:     "edit",
		Short:   "Edit a message text",
		Long:    `Edit the text of a message sent by the bot.`,
		Example: `  telegram message edit --chat-id 123456 --message-id 42 --text "New text"`,
		RunE:    runE,
	}

	cmd.Flags().String("chat-id", "", "Target chat ID or @username")
	cmd.Flags().Int("message-id", 0, "Message ID to edit")
	cmd.Flags().String("text", "", "New message text")
	cmd.Flags().String("parse-mode", "", "Parse mode: HTML, MarkdownV2, Markdown")

	return cmd
}
