package create

import (
	"github.com/spf13/cobra"
)

func NewCmd() *cobra.Command {
	cmd := &cobra.Command{
		Use:     "create",
		Short:   "Create a forum topic",
		Long:    `Create a topic in a forum supergroup.`,
		Example: `  telegram forum create --chat-id @channel --name "Announcements"`,
		RunE:    runE,
	}

	cmd.Flags().String("chat-id", "", "Target supergroup chat ID or @username")
	cmd.Flags().String("name", "", "Topic name")
	cmd.Flags().Int("icon-color", 0, "Color of the topic icon (RGB hex int)")
	cmd.Flags().String("icon-custom-emoji-id", "", "Custom emoji ID for the topic icon")

	return cmd
}
