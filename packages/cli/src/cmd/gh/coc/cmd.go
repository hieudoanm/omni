package coc

import (
	"github.com/spf13/cobra"
)

func NewCommand() *cobra.Command {
	cmd := &cobra.Command{
		Use:   "coc",
		Short: "Fetch a GitHub Code of Conduct",
		Long: `Fetch and save a GitHub Code of Conduct to a file.

Fetches the list of available codes of conduct from the GitHub API,
prompts the user to select one (or uses --key), then writes the body
to a file.`,
		Example: `  gh coc
  gh coc --key citizen_code_of_conduct
  gh coc --key contributor_covenant -o COC.md`,
		RunE: func(cmd *cobra.Command, args []string) error {
			jsonOutput, _ := cmd.Flags().GetBool("json")
			key, _ := cmd.Flags().GetString("key")
			output, _ := cmd.Flags().GetString("output")
			return runCoc(key, output, jsonOutput)
		},
	}

	cmd.Flags().String("key", "", "Code of Conduct key (skip prompt)")
	cmd.Flags().StringP("output", "o", "CODE_OF_CONDUCT", "Output file path")
	return cmd
}
