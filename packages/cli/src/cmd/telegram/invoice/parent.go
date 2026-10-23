package invoice

import (
	"github.com/hieudoanm/omni/packages/cli/src/cmd/telegram/invoice/create"
	"github.com/hieudoanm/omni/packages/cli/src/cmd/telegram/invoice/pre_checkout"
	"github.com/hieudoanm/omni/packages/cli/src/cmd/telegram/invoice/shipping"
	"github.com/spf13/cobra"
)

func NewCmd() *cobra.Command {
	cmd := &cobra.Command{
		Use:   "invoice",
		Short: "Create and manage invoices",
		RunE:  func(cmd *cobra.Command, args []string) error { return cmd.Help() },
	}
	cmd.AddCommand(create.NewCmd())
	cmd.AddCommand(pre_checkout.NewCmd())
	cmd.AddCommand(shipping.NewCmd())
	return cmd
}
