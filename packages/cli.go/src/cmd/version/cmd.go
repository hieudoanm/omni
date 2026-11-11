package version

import (
	"github.com/spf13/cobra"
)

var V = "dev"

func NewCommand() *cobra.Command {
	cmd := &cobra.Command{
		Use:   "version",
		Short: "Print the application version",
		Long:  `Print the version number of the application.`,
		Example: `  version
  version --json`,
		RunE: func(cmd *cobra.Command, args []string) error {
			jsonOutput, _ := cmd.Flags().GetBool("json")
			return runVersion(jsonOutput)
		},
	}
	cmd.Flags().BoolP("json", "j", false, "Output in JSON format")
	return cmd
}
