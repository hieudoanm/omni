package pre_checkout

import (
	"github.com/spf13/cobra"
)

func NewCmd() *cobra.Command {
	cmd := &cobra.Command{
		Use:     "pre-checkout",
		Short:   "Answer a pre-checkout query",
		Long:    `Answer a pre-checkout query from a user.`,
		Example: `  telegram invoice pre-checkout --pre-checkout-query-id "12345" --ok`,
		RunE:    runE,
	}

	cmd.Flags().String("pre-checkout-query-id", "", "Pre-checkout query ID")
	cmd.Flags().Bool("ok", true, "Approve the pre-checkout query")
	cmd.Flags().String("error-message", "", "Error message (required if ok=false)")

	return cmd
}
