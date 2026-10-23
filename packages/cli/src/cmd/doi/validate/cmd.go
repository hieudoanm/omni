package validate

import (
	"github.com/spf13/cobra"
)

func NewCmd() *cobra.Command {
	return &cobra.Command{
		Use:   "validate [doi]",
		Short: "Validate a DOI string format",
		Long:  `Checks whether a given string conforms to the DOI syntax (10.NNNN/...).`,
		Example: `  doi validate 10.1000/xyz123
  doi validate 10.1234/invalid`,
		Args: cobra.MaximumNArgs(1),
		RunE: func(cmd *cobra.Command, args []string) error {
			return runValidate(cmd, args)
		},
	}
}
