package send

import (
	"github.com/spf13/cobra"
)

func NewCmd() *cobra.Command {
	cmd := &cobra.Command{
		Use:     "send",
		Short:   "Send a gift",
		Long:    `Send a gift to a user by gift ID.`,
		Example: `  telegram gift send --user-id 12345 --gift-id "gift_id_here" --text "Congrats!"`,
		RunE:    runE,
	}

	cmd.Flags().Int64("user-id", 0, "Target user ID")
	cmd.Flags().String("gift-id", "", "Gift identifier")
	cmd.Flags().String("text", "", "Text accompanying the gift")
	cmd.Flags().String("text-parse-mode", "", "Text parse mode: MarkdownV2/HTML")
	cmd.Flags().Bool("protect-content", false, "Protect forwarded content")

	return cmd
}
