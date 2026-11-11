package languages

import (
	"github.com/spf13/cobra"
)

func NewCommand() *cobra.Command {
	var repo string
	cmd := &cobra.Command{
		Use:   "languages [--repo <owner/repo>]",
		Short: "Show repository language breakdown and generate SVG bar chart",
		Long: `Fetches language statistics for a GitHub repository and generates
an SVG bar chart showing the breakdown.`,
		Example: `  gh languages --repo hieudoanm/hieudoanm.github.io
  gh languages --repo hieudoanm/hieudoanm --output lang.svg`,
		RunE: func(cmd *cobra.Command, args []string) error {
			jsonOutput, _ := cmd.Flags().GetBool("json")
			output, _ := cmd.Flags().GetString("output")
			return runLanguages(repo, output, jsonOutput)
		},
	}

	cmd.Flags().StringVarP(&repo, "repo", "r", "", "Repository (owner/repo)")
	cmd.Flags().StringP("output", "o", "languages.svg", "Output SVG file path")
	return cmd
}
