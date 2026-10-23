package openrouter

import (
	"github.com/spf13/cobra"

	"github.com/hieudoanm/omni/packages/cli/src/cmd/openrouter/code"
	"github.com/hieudoanm/omni/packages/cli/src/cmd/openrouter/hook"
	"github.com/hieudoanm/omni/packages/cli/src/cmd/openrouter/models"
	"github.com/hieudoanm/omni/packages/cli/src/cmd/openrouter/serve"
	"github.com/hieudoanm/omni/packages/cli/src/cmd/openrouter/status"
)

func NewCommand() *cobra.Command {
	cmd := &cobra.Command{
		Use:   "openrouter",
		Short: "Interact with OpenRouter AI models and services",
		Long:  `Interact with OpenRouter AI models: serve a local API proxy, probe model availability, list free models, and run an AI coding assistant TUI.`,
		Example: `  openrouter serve
  openrouter status
  openrouter models
  openrouter code`,
		RunE: func(cmd *cobra.Command, args []string) error { return cmd.Help() },
	}
	cmd.PersistentFlags().BoolP("json", "j", false, "Output in JSON format")
	cmd.AddCommand(serve.NewCmd())
	cmd.AddCommand(status.NewCmd())
	cmd.AddCommand(models.NewCmd())
	cmd.AddCommand(hook.NewCmd())
	cmd.AddCommand(code.NewCmd())
	return cmd
}
