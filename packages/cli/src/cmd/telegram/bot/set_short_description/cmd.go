package set_short_description

import (
	"github.com/spf13/cobra"
)

func NewCmd() *cobra.Command {
	cmd := &cobra.Command{
		Use:     "set-short-description",
		Short:   "Set bot short description",
		Long:    `Change the bot's short description (displayed on the bot profile).`,
		Example: `  telegram bot set-short-description --short-description "Does cool things" --language-code en`,
		RunE:    runE,
	}

	cmd.Flags().String("short-description", "", "New short description (up to 120 chars)")
	cmd.Flags().String("language-code", "", "Language code (e.g. en)")

	return cmd
}
