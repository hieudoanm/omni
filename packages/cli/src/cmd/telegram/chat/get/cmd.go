package get

import (
	"github.com/spf13/cobra"
)

func NewCmd() *cobra.Command {
	cmd := &cobra.Command{
		Use:     "get",
		Short:   "Get chat info",
		Long:    `Get up-to-date information about a chat.`,
		Example: `  telegram chat get --chat-id @channel`,
		RunE:    runE,
	}

	cmd.Flags().String("chat-id", "", "Target chat ID or @username")

	return cmd
}
