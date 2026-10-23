package send

import (
	"github.com/spf13/cobra"
)

func NewCmd() *cobra.Command {
	cmd := &cobra.Command{
		Use:     "send",
		Short:   "Send a contact",
		Long:    `Send a phone contact to a Telegram chat.`,
		Example: `  telegram contact send --chat-id @channel --phone-number "+1234567890" --first-name "John" --last-name "Doe"`,
		RunE:    runE,
	}

	cmd.Flags().String("chat-id", "", "Target chat ID or @username")
	cmd.Flags().String("phone-number", "", "Contact's phone number")
	cmd.Flags().String("first-name", "", "Contact's first name")
	cmd.Flags().String("last-name", "", "Contact's last name")
	cmd.Flags().String("vcard", "", "Additional vCard data")
	cmd.Flags().Bool("disable-notification", false, "Send silently")
	cmd.Flags().Bool("protect-content", false, "Protect forwarded content")
	cmd.Flags().Int("reply-to-message-id", 0, "Reply to a message")

	return cmd
}
