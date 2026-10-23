package venue

import (
	"github.com/hieudoanm/omni/packages/cli/src/cmd/telegram/venue/send"
	"github.com/spf13/cobra"
)

func NewCmd() *cobra.Command {
	cmd := &cobra.Command{
		Use:   "venue",
		Short: "Send venues",
		RunE: func(cmd *cobra.Command, args []string) error {
			return cmd.Help()
		},
	}
	cmd.AddCommand(send.NewCmd())
	return cmd
}
