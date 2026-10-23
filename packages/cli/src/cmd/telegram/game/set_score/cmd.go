package set_score

import (
	"github.com/spf13/cobra"
)

func NewCmd() *cobra.Command {
	cmd := &cobra.Command{
		Use:     "set-score",
		Short:   "Set a game score",
		Long:    `Set the score for a user in a game.`,
		Example: `  telegram game set-score --user-id 12345 --score 100 --chat-id @channel --message-id 42`,
		RunE:    runE,
	}

	cmd.Flags().Int64("user-id", 0, "Target user ID")
	cmd.Flags().Int("score", 0, "New score")
	cmd.Flags().Bool("force", false, "Force score update even if lower")
	cmd.Flags().Bool("disable-edit-message", false, "Do not auto-edit message")
	cmd.Flags().String("chat-id", "", "Chat ID (required for non-inline messages)")
	cmd.Flags().Int("message-id", 0, "Message ID (required for non-inline messages)")
	cmd.Flags().String("inline-message-id", "", "Inline message ID")

	return cmd
}
