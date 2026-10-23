package high_scores

import (
	"github.com/spf13/cobra"
)

func NewCmd() *cobra.Command {
	cmd := &cobra.Command{
		Use:     "high-scores",
		Short:   "Get game high scores",
		Long:    `Get the high scores for a user in a game.`,
		Example: `  telegram game high-scores --user-id 12345 --chat-id @channel --message-id 42`,
		RunE:    runE,
	}

	cmd.Flags().Int64("user-id", 0, "Target user ID")
	cmd.Flags().String("chat-id", "", "Chat ID (required for non-inline messages)")
	cmd.Flags().Int("message-id", 0, "Message ID (required for non-inline messages)")
	cmd.Flags().String("inline-message-id", "", "Inline message ID")

	return cmd
}
