package streamer

import (
	"github.com/spf13/cobra"
)

func NewCmd() *cobra.Command {
	cmd := &cobra.Command{
		Use:   "streamer",
		Short: "List live streamers",
		Long:  "Show currently live Lichess streamers on Twitch and YouTube.",
		RunE:  runStreamer,
	}

	cmd.Flags().Bool("json", false, "Output as JSON")

	return cmd
}
