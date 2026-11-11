package send

import (
	"github.com/spf13/cobra"
)

func NewCmd() *cobra.Command {
	cmd := &cobra.Command{
		Use:   "send",
		Short: "Send a poll",
		Long:  `Send a native poll or quiz to a Telegram chat.`,
		Example: `  telegram poll send --chat-id @channel --question "Favorite color?" --options '[{"text":"Red"},{"text":"Blue"},{"text":"Green"}]'
  telegram poll send --chat-id @channel --question "Quiz" --options '[{"text":"A"},{"text":"B"}]' --type quiz --correct-option-ids 0`,
		RunE: runE,
	}

	cmd.Flags().String("chat-id", "", "Target chat ID or @username")
	cmd.Flags().String("question", "", "Poll question")
	cmd.Flags().String("options", "", "JSON array of option objects")
	cmd.Flags().String("type", "", "Poll type: regular or quiz")
	cmd.Flags().Bool("is-anonymous", true, "Poll is anonymous")
	cmd.Flags().Bool("allows-multiple-answers", false, "Allow multiple answers")
	cmd.Flags().String("correct-option-ids", "", "JSON array of correct option indices (for quiz)")
	cmd.Flags().Int("open-period", 0, "Poll open period in seconds")
	cmd.Flags().Int("close-date", 0, "Poll close date in Unix time")
	cmd.Flags().Bool("is-closed", false, "Close the poll immediately")
	cmd.Flags().Bool("disable-notification", false, "Send silently")
	cmd.Flags().Bool("protect-content", false, "Protect forwarded content")
	cmd.Flags().Int("reply-to-message-id", 0, "Reply to a message")

	return cmd
}
