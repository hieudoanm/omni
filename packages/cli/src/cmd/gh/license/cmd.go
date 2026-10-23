package license

import (
	"github.com/spf13/cobra"
)

func NewCommand() *cobra.Command {
	cmd := &cobra.Command{
		Use:   "license",
		Short: "Fetch a license template from GitHub",
		Long: `Fetch and save a license template from the GitHub licenses API.

Fetches the list of available licenses, prompts the user to select
one (or uses --spdx-id), then writes the license body to a file.`,
		Example: `  gh license
  gh license --spdx-id MIT
  gh license --spdx-id Apache-2.0 -o LICENSE.txt`,
		RunE: func(cmd *cobra.Command, args []string) error {
			jsonOutput, _ := cmd.Flags().GetBool("json")
			spdxID, _ := cmd.Flags().GetString("spdx-id")
			output, _ := cmd.Flags().GetString("output")
			return runLicense(spdxID, output, jsonOutput)
		},
	}

	cmd.Flags().String("spdx-id", "", "SPDX license identifier (skip prompt)")
	cmd.Flags().StringP("output", "o", "LICENSE", "Output file path")
	return cmd
}
