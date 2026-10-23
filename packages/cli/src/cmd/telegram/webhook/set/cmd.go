package set

import (
	"github.com/spf13/cobra"
)

func NewCmd() *cobra.Command {
	cmd := &cobra.Command{
		Use:     "set",
		Short:   "Set a Telegram webhook URL",
		Long:    `Register a webhook URL to receive Telegram updates.`,
		Example: `  telegram webhook set --url https://example.com/webhook`,
		RunE:    runE,
	}

	cmd.Flags().String("url", "", "Webhook URL (HTTPS)")

	return cmd
}
