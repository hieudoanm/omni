package shopify

import (
	"github.com/hieudoanm/omni/packages/cli/src/cmd/web/shopify/detect"
	"github.com/spf13/cobra"
)

func NewCmd() *cobra.Command {
	cmd := &cobra.Command{
		Use:     "shopify",
		Short:   "Shopify detection and analysis tools",
		Long:    `Detect whether a website is built with Shopify and identify Shopify Plus stores.`,
		Example: `  web shopify detect example.com`,
		RunE:    func(cmd *cobra.Command, args []string) error { return cmd.Help() },
	}
	cmd.AddCommand(detect.NewCmd())
	return cmd
}
