package get_me

import (
	"github.com/spf13/cobra"
)

func NewCmd() *cobra.Command {
	cmd := &cobra.Command{
		Use:     "get-me",
		Short:   "Get bot info",
		Long:    `Get basic information about the bot (via getMe).`,
		Example: `  telegram bot get-me`,
		RunE:    runE,
	}

	return cmd
}
