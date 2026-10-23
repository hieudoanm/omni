package validate

import (
	"github.com/spf13/cobra"
)

func NewCmd() *cobra.Command {
	var versions []string
	cmd := &cobra.Command{
		Use:   "validate [--versions <v1,v2,...>]",
		Short: "Validate one or more semver strings",
		Long:  `Validate whether one or more comma-separated strings conform to semantic versioning (major.minor.patch, optionally with "v" prefix).`,
		Example: `  semver validate --versions 1.2.3
  semver validate --versions 1.2.3,2.0.0,abc
  semver validate --versions v1.0.0`,
		RunE: func(cmd *cobra.Command, args []string) error {
			jsonOutput, _ := cmd.Flags().GetBool("json")
			return runValidate(versions, jsonOutput)
		},
	}
	cmd.Flags().StringSliceVar(&versions, "versions", nil, "Comma-separated versions to validate")
	cmd.Flags().BoolP("json", "j", false, "Output in JSON format")
	return cmd
}
