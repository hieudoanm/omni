package restrict

import (
	"github.com/spf13/cobra"
)

func NewCmd() *cobra.Command {
	cmd := &cobra.Command{
		Use:     "restrict",
		Short:   "Restrict a user in a chat",
		Long:    `Restrict a user in a supergroup by setting permissions.`,
		Example: `  telegram chat restrict --chat-id @channel --user-id 123456789 --permissions '{"can_send_messages":false}'`,
		RunE:    runE,
	}

	cmd.Flags().String("chat-id", "", "Target chat ID or @username")
	cmd.Flags().Int64("user-id", 0, "User ID to restrict")
	cmd.Flags().String("permissions", "", "JSON object with permission flags")
	cmd.Flags().Int64("until-date", 0, "Date when restrictions expire (Unix time)")
	cmd.Flags().Bool("use-independent-chat-permissions", false, "Set permissions independently")

	return cmd
}
