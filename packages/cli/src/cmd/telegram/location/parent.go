package location

import (
	"github.com/hieudoanm/omni/packages/cli/src/cmd/telegram/location/send"
	"github.com/spf13/cobra"
)

func NewCmd() *cobra.Command {
	cmd := &cobra.Command{
		Use:   "location",
		Short: "Send locations",
		RunE: func(cmd *cobra.Command, args []string) error {
			return cmd.Help()
		},
	}
	cmd.AddCommand(send.NewCmd())
	return cmd
}
