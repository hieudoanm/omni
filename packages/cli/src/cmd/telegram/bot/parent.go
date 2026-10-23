package bot

import (
	"github.com/hieudoanm/omni/packages/cli/src/cmd/telegram/bot/get_me"
	"github.com/hieudoanm/omni/packages/cli/src/cmd/telegram/bot/set_commands"
	"github.com/hieudoanm/omni/packages/cli/src/cmd/telegram/bot/set_description"
	"github.com/hieudoanm/omni/packages/cli/src/cmd/telegram/bot/set_name"
	"github.com/hieudoanm/omni/packages/cli/src/cmd/telegram/bot/set_short_description"
	"github.com/spf13/cobra"
)

func NewCmd() *cobra.Command {
	cmd := &cobra.Command{
		Use:   "bot",
		Short: "Bot management",
		Long:  `Get bot info, manage bot profile, and configure bot settings.`,
		Example: `  telegram bot get-me
  telegram bot set-name --name "MyBot"
  telegram bot set-description --description "A helpful bot"
  telegram bot set-short-description --short-description "Does cool things"
  telegram bot set-commands --commands '[{"command":"start","description":"Start"}]'`,
		RunE: func(cmd *cobra.Command, args []string) error { return cmd.Help() },
	}
	cmd.AddCommand(get_me.NewCmd())
	cmd.AddCommand(set_name.NewCmd())
	cmd.AddCommand(set_description.NewCmd())
	cmd.AddCommand(set_short_description.NewCmd())
	cmd.AddCommand(set_commands.NewCmd())
	return cmd
}
