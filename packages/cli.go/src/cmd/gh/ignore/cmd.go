package ignore

import (
	"github.com/spf13/cobra"
)

func NewCommand() *cobra.Command {
	cmd := &cobra.Command{
		Use:   "ignore",
		Short: "Fetch a .gitignore template from GitHub",
		Long: `Fetch and save a .gitignore template from the GitHub gitignore API.

Fetches the list of available templates, prompts the user to select
one (or uses --name), then writes the template content to a file.`,
		Example: `  gh ignore
  gh ignore --name Go
  gh ignore --name Python -o .gitignore`,
		RunE: func(cmd *cobra.Command, args []string) error {
			jsonOutput, _ := cmd.Flags().GetBool("json")
			name, _ := cmd.Flags().GetString("name")
			output, _ := cmd.Flags().GetString("output")
			return runIgnore(name, output, jsonOutput)
		},
	}

	cmd.Flags().String("name", "", "Gitignore template name (skip prompt)")
	cmd.Flags().StringP("output", "o", ".gitignore", "Output file path")
	return cmd
}
