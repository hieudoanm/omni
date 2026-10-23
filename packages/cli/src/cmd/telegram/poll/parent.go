package poll

import (
	"github.com/hieudoanm/omni/packages/cli/src/cmd/telegram/poll/send"
	"github.com/spf13/cobra"
)

func NewCmd() *cobra.Command {
	cmd := &cobra.Command{
		Use:   "poll",
		Short: "Send polls",
		RunE: func(cmd *cobra.Command, args []string) error {
			return cmd.Help()
		},
	}
	cmd.AddCommand(send.NewCmd())
	return cmd
}
