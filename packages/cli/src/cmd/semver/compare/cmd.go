package compare

import (
	"github.com/spf13/cobra"
)

func NewCmd() *cobra.Command {
	var aStr, bStr string
	cmd := &cobra.Command{
		Use:     "compare --a <version> --b <version>",
		Short:   "Compare two semver strings",
		Long:    `Compare two semantic versions and output their relationship (less than, greater than, or equal). Versions may be prefixed with "v".`,
		Example: "  semver compare --a 1.0.0 --b 2.0.0\n  semver compare --a v1.2.3 --b v1.2.3",
		RunE: func(cmd *cobra.Command, args []string) error {
			jsonOutput, _ := cmd.Flags().GetBool("json")
			return runCompare(aStr, bStr, jsonOutput)
		},
	}
	cmd.Flags().StringVar(&aStr, "a", "", "First version")
	cmd.Flags().StringVar(&bStr, "b", "", "Second version")
	cmd.Flags().BoolP("json", "j", false, "Output in JSON format")
	return cmd
}
