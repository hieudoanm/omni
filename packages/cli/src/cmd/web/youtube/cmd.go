package youtube

import (
	"github.com/spf13/cobra"

	"github.com/hieudoanm/omni/packages/cli/src/cmd/web/youtube/fetch"
	"github.com/hieudoanm/omni/packages/cli/src/cmd/web/youtube/thumbnails"
)

func NewCmd() *cobra.Command {
	cmd := &cobra.Command{
		Use:   "youtube",
		Short: "YouTube transcript and thumbnail tools",
		Long:  `Fetch YouTube video transcripts and download thumbnails in various qualities.`,
		Example: `  web youtube fetch --url dQw4w9WgXcQ
  web youtube thumbnails --url dQw4w9WgXcQ`,
		RunE: func(cmd *cobra.Command, args []string) error { return cmd.Help() },
	}

	cmd.AddCommand(fetch.NewCmd())
	cmd.AddCommand(thumbnails.NewCmd())

	return cmd
}
