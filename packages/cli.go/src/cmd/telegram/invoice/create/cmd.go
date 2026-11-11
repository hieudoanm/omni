package create

import (
	"github.com/spf13/cobra"
)

func NewCmd() *cobra.Command {
	cmd := &cobra.Command{
		Use:     "create",
		Short:   "Create an invoice link",
		Long:    `Create a link for an invoice (Star Payments or custom provider).`,
		Example: `  telegram invoice create --title "Item" --description "Desc" --payload "{}" --currency XTR --prices '[{"label":"Item","amount":1}]'`,
		RunE:    runE,
	}

	cmd.Flags().String("title", "", "Product title")
	cmd.Flags().String("description", "", "Product description")
	cmd.Flags().String("payload", "", "Bot-defined payload JSON")
	cmd.Flags().String("currency", "XTR", "Currency (XTR for Stars, or fiat code)")
	cmd.Flags().String("prices", "", "JSON array of labeled price objects")
	cmd.Flags().Int("max-tip-amount", 0, "Maximum tip amount")
	cmd.Flags().String("suggested-tip-amounts", "", "JSON array of suggested tip amounts")
	cmd.Flags().String("provider-token", "", "Payment provider token")
	cmd.Flags().Bool("need-name", false, "Ask for user's full name")
	cmd.Flags().Bool("need-phone", false, "Ask for phone number")
	cmd.Flags().Bool("need-email", false, "Ask for email")
	cmd.Flags().Bool("need-shipping-address", false, "Ask for shipping address")
	cmd.Flags().Bool("send-phone-to-provider", false, "Send phone to provider")
	cmd.Flags().Bool("send-email-to-provider", false, "Send email to provider")
	cmd.Flags().Bool("is-flexible", false, "Final price depends on shipping")

	return cmd
}
