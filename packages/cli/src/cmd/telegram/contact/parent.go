package contact

import (
	"github.com/hieudoanm/omni/packages/cli/src/cmd/telegram/contact/send"
	"github.com/spf13/cobra"
)

func NewCmd() *cobra.Command {
	cmd := &cobra.Command{
		Use:   "contact",
		Short: "Send contacts",
		RunE: func(cmd *cobra.Command, args []string) error {
			return cmd.Help()
		},
	}
	cmd.AddCommand(send.NewCmd())
	return cmd
}
