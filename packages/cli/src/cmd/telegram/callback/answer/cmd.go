package answer

import (
	"github.com/spf13/cobra"
)

func NewCmd() *cobra.Command {
	cmd := &cobra.Command{
		Use:     "answer",
		Short:   "Answer a callback query",
		Long:    `Send an answer to a callback query from an inline keyboard.`,
		Example: `  telegram callback answer --callback-query-id "12345" --text "Done!" --show-alert`,
		RunE:    runE,
	}

	cmd.Flags().String("callback-query-id", "", "Callback query ID")
	cmd.Flags().String("text", "", "Notification text")
	cmd.Flags().Bool("show-alert", false, "Show alert instead of toast")
	cmd.Flags().String("url", "", "URL to open")
	cmd.Flags().Int("cache-time", 0, "Cache time in seconds")

	return cmd
}
