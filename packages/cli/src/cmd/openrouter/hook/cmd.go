package hook

import (
	"github.com/spf13/cobra"
)

func NewCmd() *cobra.Command {
	return &cobra.Command{
		Use:     "hook",
		Short:   "Start webhook server on :8080 and expose via ngrok and hook it to telegram",
		Long:    `Start a webhook server on port 8080, expose it via ngrok, and register with Telegram. Routes incoming Telegram messages through OpenRouter AI and sends replies back. Requires TELEGRAM_API_TOKEN and OPEN_ROUTER_API_KEY env vars.`,
		Example: `  openrouter hook`,
		RunE: func(cmd *cobra.Command, args []string) error {
			return runHook()
		},
	}
}
