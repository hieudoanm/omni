package streamer

import (
	"github.com/spf13/cobra"
)

func NewCmd() *cobra.Command {
	cmd := &cobra.Command{
		Use:     "streamer",
		Short:   "Show Chess.com streamers",
		Long:    `Fetch and display Chess.com streamers.`,
		Example: `  chess com streamer`,
		RunE:    runStreamer,
	}
	return cmd
}
