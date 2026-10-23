package delete

import (
	"github.com/spf13/cobra"
)

func NewCmd() *cobra.Command {
	cmd := &cobra.Command{
		Use:     "delete",
		Short:   "Delete the Telegram webhook",
		Long:    `Remove the currently registered webhook.`,
		Example: `  telegram webhook delete`,
		RunE:    runE,
	}

	return cmd
}
