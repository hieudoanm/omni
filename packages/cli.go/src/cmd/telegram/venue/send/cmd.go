package send

import (
	"github.com/spf13/cobra"
)

func NewCmd() *cobra.Command {
	cmd := &cobra.Command{
		Use:     "send",
		Short:   "Send a venue",
		Long:    `Send venue information to a Telegram chat.`,
		Example: `  telegram venue send --chat-id @channel --latitude 48.8566 --longitude 2.3522 --title "Eiffel Tower" --address "Champ de Mars"`,
		RunE:    runE,
	}

	cmd.Flags().String("chat-id", "", "Target chat ID or @username")
	cmd.Flags().Float64("latitude", 0, "Latitude")
	cmd.Flags().Float64("longitude", 0, "Longitude")
	cmd.Flags().String("title", "", "Venue name")
	cmd.Flags().String("address", "", "Venue address")
	cmd.Flags().String("foursquare-id", "", "Foursquare venue ID")
	cmd.Flags().String("foursquare-type", "", "Foursquare venue type")
	cmd.Flags().String("google-place-id", "", "Google Place ID")
	cmd.Flags().String("google-place-type", "", "Google Place type")
	cmd.Flags().Bool("disable-notification", false, "Send silently")
	cmd.Flags().Bool("protect-content", false, "Protect forwarded content")
	cmd.Flags().Int("reply-to-message-id", 0, "Reply to a message")

	return cmd
}
