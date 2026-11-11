package shipping

import (
	"github.com/spf13/cobra"
)

func NewCmd() *cobra.Command {
	cmd := &cobra.Command{
		Use:     "shipping",
		Short:   "Answer a shipping query",
		Long:    `Answer a shipping query from a user.`,
		Example: `  telegram invoice shipping --shipping-query-id "12345" --ok --shipping-options '[{"id":"standard","title":"Standard","prices":[{"label":"Shipping","amount":500}]}]'`,
		RunE:    runE,
	}

	cmd.Flags().String("shipping-query-id", "", "Shipping query ID")
	cmd.Flags().Bool("ok", true, "Accept the shipping query")
	cmd.Flags().String("shipping-options", "", "JSON array of shipping options (required if ok=true)")
	cmd.Flags().String("error-message", "", "Error message (required if ok=false)")

	return cmd
}
