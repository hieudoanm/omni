package detect

import (
	"github.com/spf13/cobra"
)

func NewCmd() *cobra.Command {
	var (
		flagVerbose bool
		flagJSON    bool
	)

	cmd := &cobra.Command{
		Use:   "detect [url]",
		Short: "Detect if a website is using Shopify",
		Long:  `Check a website URL for Shopify indicators including CDN references, script patterns, storefront API, and Shopify Plus headers.`,
		Example: `  web shopify detect example.com
  web shopify detect https://shop.example.com --verbose`,
		Args: cobra.MaximumNArgs(1),
		RunE: func(cmd *cobra.Command, args []string) error {
			return detectRun(args, flagVerbose, flagJSON)
		},
	}

	cmd.Flags().BoolVarP(&flagVerbose, "verbose", "v", false, "Show detection signals")
	cmd.Flags().BoolVar(&flagJSON, "json", false, "Output in JSON format")
	return cmd
}
