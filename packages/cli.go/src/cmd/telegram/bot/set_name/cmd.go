package set_name

import (
	"github.com/spf13/cobra"
)

func NewCmd() *cobra.Command {
	cmd := &cobra.Command{
		Use:     "set-name",
		Short:   "Set bot name",
		Long:    `Change the bot's name.`,
		Example: `  telegram bot set-name --name "MyBot" --language-code en`,
		RunE:    runE,
	}

	cmd.Flags().String("name", "", "New bot name")
	cmd.Flags().String("language-code", "", "Language code (e.g. en)")

	return cmd
}
