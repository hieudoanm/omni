package send

import (
	"github.com/spf13/cobra"
)

func NewCmd() *cobra.Command {
	cmd := &cobra.Command{
		Use:     "send",
		Short:   "Send a location",
		Long:    `Send a geographic location to a Telegram chat.`,
		Example: `  telegram location send --chat-id @channel --latitude 48.8566 --longitude 2.3522`,
		RunE:    runE,
	}

	cmd.Flags().String("chat-id", "", "Target chat ID or @username")
	cmd.Flags().Float64("latitude", 0, "Latitude")
	cmd.Flags().Float64("longitude", 0, "Longitude")
	cmd.Flags().Float64("horizontal-accuracy", 0, "Horizontal accuracy in meters")
	cmd.Flags().Int("live-period", 0, "Live location period in seconds")
	cmd.Flags().Int("heading", 0, "Direction in degrees (1-360)")
	cmd.Flags().Int("proximity-alert-radius", 0, "Proximity alert radius in meters")
	cmd.Flags().Bool("disable-notification", false, "Send silently")
	cmd.Flags().Bool("protect-content", false, "Protect forwarded content")
	cmd.Flags().Int("reply-to-message-id", 0, "Reply to a message")

	return cmd
}
