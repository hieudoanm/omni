package set_description

import (
	"github.com/spf13/cobra"
)

func NewCmd() *cobra.Command {
	cmd := &cobra.Command{
		Use:     "set-description",
		Short:   "Set bot description",
		Long:    `Change the bot's description (short text shown on the bot profile).`,
		Example: `  telegram bot set-description --description "A helpful bot" --language-code en`,
		RunE:    runE,
	}

	cmd.Flags().String("description", "", "New bot description (up to 512 chars)")
	cmd.Flags().String("language-code", "", "Language code (e.g. en)")

	return cmd
}
