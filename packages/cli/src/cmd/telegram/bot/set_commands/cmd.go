package set_commands

import (
	"github.com/spf13/cobra"
)

func NewCmd() *cobra.Command {
	cmd := &cobra.Command{
		Use:     "set-commands",
		Short:   "Set bot commands",
		Long:    `Set the list of the bot's commands for the command menu.`,
		Example: `  telegram bot set-commands --commands '[{"command":"start","description":"Start the bot"},{"command":"help","description":"Get help"}]'`,
		RunE:    runE,
	}

	cmd.Flags().String("commands", "", "JSON array of command objects")
	cmd.Flags().String("scope", "", "JSON object with command scope")
	cmd.Flags().String("language-code", "", "Language code (e.g. en)")

	return cmd
}
