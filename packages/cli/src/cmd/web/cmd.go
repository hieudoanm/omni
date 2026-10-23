package web

import (
	"github.com/hieudoanm/omni/packages/cli/src/cmd/web/shopify"
	"github.com/hieudoanm/omni/packages/cli/src/cmd/web/simplify"
	"github.com/hieudoanm/omni/packages/cli/src/cmd/web/snapshot"
	"github.com/hieudoanm/omni/packages/cli/src/cmd/web/weather"
	"github.com/hieudoanm/omni/packages/cli/src/cmd/web/youtube"
	"github.com/spf13/cobra"
)

func NewCommand() *cobra.Command {
	cmd := &cobra.Command{
		Use:   "web",
		Short: "Web service tools",
		Long:  `Interact with web services: download Instagram content, detect Shopify sites, capture page snapshots, fetch weather, and retrieve YouTube transcripts.`,
		Example: `  web weather London
  web snapshot --url https://example.com
  web youtube fetch --url dQw4w9WgXcQ
  web instagram download --url CLI7qRNhI_o`,
		RunE: func(cmd *cobra.Command, args []string) error { return cmd.Help() },
	}
	cmd.AddCommand(
		shopify.NewCmd(),
		simplify.NewCmd(),
		snapshot.NewCmd(),
		weather.NewCmd(),
		youtube.NewCmd(),
	)
	cmd.PersistentFlags().BoolP("json", "j", false, "Output in JSON format")
	return cmd
}
