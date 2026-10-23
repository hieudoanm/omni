package og

import (
	"github.com/spf13/cobra"
)

func NewCommand() *cobra.Command {
	var url string
	cmd := &cobra.Command{
		Use:   "og [--url <owner/repo>]",
		Short: "Generate an Open Graph SVG for a GitHub repository",
		Long: `Fetches repository metadata from GitHub and generates
a 1200×630 Open Graph SVG image (social preview card).`,
		Example: `  gh og --url hieudoanm/hieudoanm.github.io
  gh og --url hieudoanm/hieudoanm --output preview.svg`,
		RunE: func(cmd *cobra.Command, args []string) error {
			jsonOutput, _ := cmd.Flags().GetBool("json")
			output, _ := cmd.Flags().GetString("output")
			return runOG(url, output, jsonOutput)
		},
	}

	cmd.Flags().StringVarP(&url, "url", "u", "", "Repository (owner/repo)")
	cmd.Flags().StringP("output", "o", "og.svg", "Output SVG file path")
	return cmd
}
