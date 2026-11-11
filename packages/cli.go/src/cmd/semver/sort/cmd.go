package sort

import (
	"github.com/spf13/cobra"
)

func NewCmd() *cobra.Command {
	var versions []string
	cmd := &cobra.Command{
		Use:   "sort [--versions <v1,v2,...>]",
		Short: "Sort one or more semver strings",
		Long:  `Sort a list of comma-separated semantic version strings in ascending order. Versions may be prefixed with "v".`,
		Example: `  semver sort --versions 1.2.0,2.0.0,1.10.0
  semver sort --versions v3.0.0,v1.0.0,v2.0.0`,
		RunE: func(cmd *cobra.Command, args []string) error {
			jsonOutput, _ := cmd.Flags().GetBool("json")
			return runSort(versions, jsonOutput)
		},
	}
	cmd.Flags().StringSliceVar(&versions, "versions", nil, "Comma-separated versions to sort")
	cmd.Flags().BoolP("json", "j", false, "Output in JSON format")
	return cmd
}
